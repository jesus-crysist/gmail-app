import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Label } from '../../shared/models';

@Component({
  selector: '[app-label-sidebar]',
  templateUrl: './label-sidebar.component.html',
  styleUrls: [ './label-sidebar.component.css' ]
})
export class LabelSidebarComponent implements OnInit {
  
  @Input() labels: Array<Label>;
  
  @Output() labelSelected: EventEmitter<Label> = new EventEmitter<Label>();
  
  constructor () {
  }
  
  ngOnInit () {
    const inbox = this.labels.find(
      (label: Label) => label.id.toUpperCase() === 'INBOX'
    );
    this.selectLabel(inbox);
  }
  
  selectLabel (label: Label): void {
    
    if (!label) {
      return;
    }
    
    label.active = true;
    this.labelSelected.emit(label);
  }
  
}
