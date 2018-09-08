import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Message } from '../../shared/models';

@Component({
  selector: 'app-mail-view',
  templateUrl: './mail-view.component.html',
  styleUrls: [ './mail-view.component.css' ]
})
export class MailViewComponent implements AfterViewInit {
  
  @Input() message: Message;
  
  @Output() reply: EventEmitter<Message> = new EventEmitter<Message>();
  @Output() forward: EventEmitter<Message> = new EventEmitter<Message>();
  @Output() remove: EventEmitter<Message> = new EventEmitter<Message>();
  
  @ViewChild('messageText')
  messageTextContainer: ElementRef;
  
  constructor () {
  }
  
  ngAfterViewInit(): void {
    const el = this.messageTextContainer.nativeElement;
  
    if (this.message.body && el && el.contentWindow) {
      el.contentWindow.document.body.innerHTML = this.message.body;
    }
  }
  
}
