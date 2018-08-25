import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { Message } from '../../shared/models';
import { GoogleClientService } from '../../shared/google';

@Component({
  selector: 'app-mail-view',
  templateUrl: './mail-view.component.html',
  styleUrls: ['./mail-view.component.css']
})
export class MailViewComponent implements OnChanges {
  
  @Input() message: Message;
  
  @Output() reply: EventEmitter<Message> = new EventEmitter<Message>();
  @Output() forward: EventEmitter<Message> = new EventEmitter<Message>();
  @Output() remove: EventEmitter<Message> = new EventEmitter<Message>();
  
  @ViewChild('messageText')
  messageTextContainer: ElementRef;
  
  constructor (googleService: GoogleClientService) {
    
    // googleService.singleMessage.subscribe((msg: Message) => {
    //
    //   if (this.message && msg.id === this.message.id) {
    //     ngZone.run(() => {
    //
    //       this.message.body = msg.body;
    //
    //       const el = this.messageTextContainer.nativeElement;
    //
    //       if (el && el.contentWindow) {
    //         el.contentWindow.document.body.innerHTML = msg.body;
    //       }
    //     });
    //   }
    // });
  }

  ngOnChanges() {
    if (this.message && this.messageTextContainer) {
      const el = this.messageTextContainer.nativeElement;
      
      if (this.message.body && el && el.contentWindow) {
        el.contentWindow.document.body.innerHTML = this.message.body;
      }
    }
  }

}
