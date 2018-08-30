import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Message } from '../../shared/models';
import { GoogleClientService } from '../../shared/google';
import { NgbAccordion, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: '[app-mail-list]',
  templateUrl: './mail-list.component.html',
  styleUrls: [ './mail-list.component.css' ]
})
export class MailListComponent implements OnInit {
  
  @Input() messages: Message[] = [];
  @Input() hasNextPage: boolean;
  @Input() hasPreviousPage: boolean;
  
  @Output() reply: EventEmitter<Message> = new EventEmitter<Message>();
  @Output() forward: EventEmitter<Message> = new EventEmitter<Message>();
  @Output() remove: EventEmitter<Message> = new EventEmitter<Message>();
  @Output() previous: EventEmitter<void> = new EventEmitter<void>();
  
  @Output() next: EventEmitter<void> = new EventEmitter<void>();
  
  selectedMessage: Message;
  
  private openedMessagePanel: string;
  
  @ViewChild(NgbAccordion) private accordion: NgbAccordion;
  
  constructor (
    private googleService: GoogleClientService
  ) {
  }
  
  ngOnInit (): void {
  }
  
  onMessageSelect (msg: Message): void {
    if (typeof msg.body !== 'string' && !msg.open) {
      
      this.selectedMessage = null;
      
      this.googleService.getMessage(msg.id).then((fullMsg: Message) => {
        
        this.selectedMessage = fullMsg;
        this.googleService.markMessageRead(msg);
        
        this.accordion.toggle(this.openedMessagePanel);
      });
    }
  }
  
  preventAutoOpen (event: NgbPanelChangeEvent): void {
    
    if (event.panelId === this.openedMessagePanel) {
      event.preventDefault();
      this.openedMessagePanel = event.panelId;
    }
  }
  
  getPreviousMessages (): void {
    this.previous.emit();
  }
  
  getNextMessages (): void {
    this.next.emit();
  }
  
}
