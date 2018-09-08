import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../login';
import { GoogleClientService } from '../shared/google';
import { ToastrService } from 'ngx-toastr';
import { Label, Message, User } from '../shared/models';
import { MailFormModalComponent } from './mail-form-modal/mail-form-modal.component';

@Component({
  selector: 'app-gmail-app',
  templateUrl: './gmail-app.component.html',
  styleUrls: [ './gmail-app.component.css' ]
})
export class GmailAppComponent implements OnInit {
  
  loggedUser: User;
  
  labelList: Array<Label> = [];
  selectedLabel: Label;
  messageList: Array<Message> = [];
  
  loading: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  
  
  @ViewChild(MailFormModalComponent) mailFormModalComponent: MailFormModalComponent;
  
  constructor (
    private router: Router,
    private authService: AuthenticationService,
    private googleService: GoogleClientService,
    private toastService: ToastrService
  ) {
    this.loggedUser = this.authService.getUser();
  }
  
  ngOnInit (): void {
    this.loadInitialData().then();
  }
  
  private async loadInitialData (): Promise<void> {
    this.loading = true;
    
    await this.googleService.loadGmailClient();
    await this.googleService.loadLabels();
    
    this.labelList = this.googleService.getLabels();
  }
  
  onLogout () {
    AuthenticationService.signOut();
    this.router.navigate([ '/login' ]);
  }
  
  async searchMessages (searchTerm: string): Promise<void> {
    this.loading = true;
    await this.googleService.loadMessages(this.selectedLabel, searchTerm);
    this.afterLoadingMessages();
  }
  
  onLabelSelected (label: Label): void {
    if (this.selectedLabel) {
      this.selectedLabel.active = false;
    }
    
    this.loading = true;
    
    this.selectedLabel = label;
    
    this.googleService.loadMessages(label).then(
      () => this.afterLoadingMessages()
    );
  }
  
  replyTo (replyToMessage: Message): void {
    const message = Object.assign({}, replyToMessage);
    message.subject = 'Re: ' + message.subject;
    message.body = '\n\n\n---' + message.body.replace('\n', '\n\t&gt;');
    
    this.openMailModal(message, true);
  }
  
  forwardMessage (forwardMessage: Message) {
    const message = Object.assign({}, forwardMessage);
    message.subject = 'Fwd: ' + message.subject;
    message.body = '\n\n\n---' + message.body.replace('\n', '\n\t&gt;');
    
    this.openMailModal(message);
  }
  
  sendMessage (message: Message): void {
    
    this.loading = true;
    
    this.googleService.sendMessage(message, () => {
      // initiate re-fetching messages in current label
      this.onLabelSelected(this.selectedLabel);
      this.toastService.success('Message sent!', `To: ${message.toEmail}`);
    });
  }
  
  deleteMessage (message: Message): void {
    
    // keep label reference so it can be later used to load new list of messages
    const currentLabel = this.selectedLabel;
    
    this.loading = true;
    
    this.googleService.deleteMessage(message,
      () => {
        // anull current selected label reference, so it doesn't "deselects" it in label list
        this.selectedLabel = null;
        // initiate re-fetching messages in current label
        this.onLabelSelected(currentLabel);
        this.toastService.success(`Subject: ${message.subject}`, 'Message deleted!');
      }
    );
  }
  
  goToPreviousPage (): void {
    this.loading = true;
    this.googleService.getPreviousMessagePage().then(() => this.afterLoadingMessages());
  }
  
  goToNextPage (): void {
    this.loading = true;
    this.googleService.getNextMessagePage().then(() => this.afterLoadingMessages());
  }
  
  private openMailModal (message?: Message, reply?: boolean): void {
    this.mailFormModalComponent.open(message, reply);
  }
  
  private afterLoadingMessages (): void {
    this.messageList = this.googleService.getMessages();
    this.hasPreviousPage = this.googleService.hasPreviousPage;
    this.hasNextPage = this.googleService.hasNextPage;
    this.loading = false;
  }
  
}
