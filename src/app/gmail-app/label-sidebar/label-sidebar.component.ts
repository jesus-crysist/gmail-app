import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Label } from '../../shared/models';
import { GoogleClientService } from '../../shared/google';

@Component({
  selector: '[app-label-sidebar]',
  templateUrl: './label-sidebar.component.html',
  styleUrls: [ './label-sidebar.component.css' ]
})
export class LabelSidebarComponent implements OnInit {
  
  @Input() labels: Array<Label>;
  @Input() initialLoading: boolean;
  
  @Output() labelSelected: EventEmitter<Label> = new EventEmitter<Label>();
  
  constructor (
    private googleService: GoogleClientService
  ) {
    
    this.labels = this.googleService.getLabels();
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
