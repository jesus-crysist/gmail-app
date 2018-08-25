import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../login';
import { GoogleClientService } from '../shared/google';
import { ToastrService } from 'ngx-toastr';
import { Folder, Message, User } from '../shared/models';

@Component({
  selector: 'app-gmail-app',
  templateUrl: './gmail-app.component.html',
  styleUrls: ['./gmail-app.component.css']
})
export class GmailAppComponent implements OnInit {
  
  loggedUser: User;
  searchTerm: string;
  
  selectedFolder: Folder;
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
    this.googleService.loadGmailClient().then(() => this.loading = false);
  }

  onLogout () {
    AuthenticationService.signOut();
    this.router.navigate([ '/login' ]);
  }
  
  searchMail(searchTerm: string): void {
    this.searchTerm = searchTerm;
  }
  
  onFolderSelected(folder: Folder): void {
    if (this.selectedFolder) {
      this.selectedFolder.active = false;
    }
    
    this.selectedFolder = folder;
    
    console.log('selected folder', folder);
  
    this.googleService.loadMessages(folder).then(() => this.messageList = this.googleService.getMessages());
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
    
    this.googleService
      .deleteMessage(message, () =>
        this.toastService.success(`Subject: ${message.subject}`, 'Message deleted!')
      );
  }
  
  private openMailModal (replyTo?: Message): void {
    console.log('reply to message', replyTo);
    // this.mailFormComponent.open(replyTo);
  }

}
