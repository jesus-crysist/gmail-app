import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Label } from '../../shared/models';
import { GoogleClientService } from '../../shared/google';

@Component({
  selector: '[app-label-sidebar]',
  templateUrl: './label-sidebar.component.html',
  styleUrls: [ './label-sidebar.component.css' ]
})
export class LabelSidebarComponent implements OnInit, AfterViewInit {
  
  @Input() searchTerm: string;
  
  @Output() labelSelected: EventEmitter<Label> = new EventEmitter<Label>();
  
  labels: Label[];
  
  constructor (
    private googleService: GoogleClientService
  ) {
    
    this.labels = this.googleService.getLabels();
  }
  
  ngOnInit () {
    this.googleService.loadLabels()
      .then(
        () => this.labels = this.googleService.getLabels()
      );
  }
  
  ngAfterViewInit(): void {
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
