import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../login';
import { GoogleClientService } from '../shared/google';
import { ToastrService } from 'ngx-toastr';
import { Label, Message, User } from '../shared/models';

@Component({
  selector: 'app-gmail-app',
  templateUrl: './gmail-app.component.html',
  styleUrls: ['./gmail-app.component.css']
})
export class GmailAppComponent implements OnInit {
  
  loggedUser: User;
  searchTerm: string;
  
  selectedLabel: Label;
  messageList: Array<Message> = [];
  
  loading: boolean;
  
  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private googleService: GoogleClientService,
    private toastService: ToastrService
  ) {
    
    this.loggedUser = this.authService.getUser();
    
  }
  
  ngOnInit(): void {
    this.loading = true;
    this.googleService.loadGmailClient().then(
      () => this.loading = false
    );
  }

  onLogout () {
    AuthenticationService.signOut();
    this.router.navigate([ '/login' ]);
  }
  
  searchMail(searchTerm: string): void {
    this.searchTerm = searchTerm;
  }
  
  onLabelSelected(label: Label): void {
    if (this.selectedLabel) {
      this.selectedLabel.active = false;
    }
    
    this.selectedLabel = label;
    
    console.log('selected label', label);
  
    this.googleService.loadMessages(label).then(
      () => this.messageList = this.googleService.getMessages()
    );
  }
  
  replyTo (replyToMessage: Message): void {
    const message = Object.assign({}, replyToMessage);
    message.subject = 'Re: ' + message.subject;
    message.body = '\n\n\n---' + message.body.replace('\n', '\n\t&gt;');
    
    this.openMailModal(message);
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
    
    this.googleService.deleteMessage(message,
        () => {
          // anull current selected label reference, so it doesn't "deselects" it in label list
          this.selectedLabel = null;
          // initiate re-fetching messages in current label
          this.onLabelSelected(currentLabel);
          this.toastService.success(`Subject: ${message.subject}`, 'Message deleted!')
        }
      );
  }
  
  private openMailModal (replyTo?: Message): void {
    console.log('reply to message', replyTo);
    // this.mailFormComponent.open(replyTo);
  }

}
