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
    this.initialLoadData().then();
  }
  
  private async initialLoadData (): Promise<void> {
    this.loading = true;
    
    await this.googleService.loadGmailClient();
    await this.googleService.loadLabels();
    
    this.labelList = this.googleService.getLabels();
  }
  
  onLogout () {
    AuthenticationService.signOut();
    this.router.navigate([ '/login' ]);
  }
  
  async searchMail (searchTerm: string): Promise<void> {
    await this.googleService.loadMessages(this.selectedLabel, searchTerm);
    this.messageList = this.googleService.getMessages();
  }
  
  onLabelSelected (label: Label): void {
    if (this.selectedLabel) {
      this.selectedLabel.active = false;
    }
    
    this.loading = true;
    
    this.selectedLabel = label;
    
    console.log('selected label', label);
    
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
  
  deleteMessage (message: Message) {
    
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
        
        this.loading = false;
      }
    );
  }
  
  sendMessage (message: Message) {
    
    this.loading = true;
    
    this.googleService.sendMessage(message, () => {
      this.toastService.success('Message sent!', `To: ${message.toEmail}`);
      this.loading = false;
    });
  }
  
  openMailModal (message?: Message, reply?: boolean): void {
    this.mailFormModalComponent.open(message, reply);
  }
  
  goToPreviousPage (): void {
    this.loading = true;
    this.googleService.getPreviousMessagePage().then(() => this.afterLoadingMessages());
  }
  
  goToNextPage (): void {
    this.loading = true;
    this.googleService.getNextMessagePage().then(() => this.afterLoadingMessages());
  }
  
  private afterLoadingMessages (): void {
    this.messageList = this.googleService.getMessages();
    this.hasPreviousPage = this.googleService.hasPreviousPage;
    this.hasNextPage = this.googleService.hasNextPage;
    this.loading = false;
  }
  
}
