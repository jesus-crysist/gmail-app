import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Message } from '../../shared/models';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../login';

@Component({
  selector: 'app-mail-form-modal',
  templateUrl: './mail-form-modal.component.html',
  styleUrls: ['./mail-form-modal.component.css']
})
export class MailFormModalComponent implements OnInit {
  
  @Output() send: EventEmitter<Message> = new EventEmitter<Message>();
  
  @ViewChild('modalContent', { read: TemplateRef }) private modalContent: TemplateRef<any>;
  private modal: NgbModalRef;
  
  message: Message;
  newOrReply: string;

  constructor(
    private authService: AuthenticationService,
    private modalService: NgbModal
  ) { }
  
  /**
   * When textarea field is filled with body of the message, place cursor at the beginning of the text.
   * This method does the *magic*.
   */
  static setCursorOnStart (): void {
    
    const input: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById('emailMessageBody');
    
    // selection start and end points are pointing to the first place in textarea
    const selectionStart = 0;
    const selectionEnd = 0;
    
    // if it is possible, just do it!
    if (input.setSelectionRange) {
      // focuso on the field
      input.focus();
      
      // set cursor (selection)
      input.setSelectionRange(selectionStart, selectionEnd);
      
      // Lose and then regain focus in order for the text to scroll to the top, where cursor positin is
      input.blur();
      input.focus();
    }
  }

  ngOnInit() {
  }
  
  open (message?: Message, reply?): void {
    
    this.setMessageModel(message, reply);
    
    this.modal = this.modalService.open(this.modalContent, { backdrop: 'static', keyboard: false, size: 'lg' });
    
    this.modal.result.then((data: any) => {
      if (!data) {
        console.log('modal closed');
        return;
      }
      
      console.log('data sent: ', data);
    });
    
    setTimeout(() => MailFormModalComponent.setCursorOnStart(), 10);
  }
  
  private setMessageModel (inputMsg?: Message, reply: boolean = false) {
    
    const user = this.authService.getUser();
    const today = new Date();
    
    let message = <Message>{
      subject: '',
      from: user.name,
      fromEmail: user.email,
      to: '',
      toEmail: '',
      date: `${today.getFullYear()}-${today.getMonth()}-${today.getDay()}`,
      mimeType: 'text/plain',
      body: '',
      read: true,
      open: true
    };
    
    if (inputMsg) {
      this.newOrReply = 'reply';
      
      message = Object.assign(message, {
        subject: inputMsg.subject,
        to: inputMsg.from,
        toEmail: reply ? inputMsg.fromEmail : null,
        mimeType: inputMsg.mimeType,
        body: inputMsg.body
      });
  
    } else {
      this.newOrReply = 'new';
    }
    
    this.message = message;
  }
  
  sendData () {
    this.send.next(this.message);
    this.modal.close();
  }
  
}

