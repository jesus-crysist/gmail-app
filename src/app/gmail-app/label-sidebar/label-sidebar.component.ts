import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Folder } from '../../shared/models';
import { GoogleClientService } from '../../shared/google';

@Component({
  selector: '[app-label-sidebar]',
  templateUrl: './label-sidebar.component.html',
  styleUrls: [ './label-sidebar.component.css' ]
})
export class LabelSidebarComponent implements OnInit, AfterViewInit {
  
  @Input() searchTerm: string;
  
  @Output() folderSelected: EventEmitter<Folder> = new EventEmitter<Folder>();
  
  folders: Folder[];
  
  constructor (
    private googleService: GoogleClientService
  ) {
    
    this.folders = this.googleService.getFolders();
  }
  
  ngOnInit () {
    this.googleService.loadFolders()
      .then(
        () => this.folders = this.googleService.getFolders()
      );
  }
  
  ngAfterViewInit(): void {
    const inbox = this.folders.find((folder: Folder) => folder.id.toUpperCase() === 'INBOX');
    this.selectFolder(inbox);
  }
  
  selectFolder (folder: Folder): void {
    
    if (!folder) {
      return;
    }
    
    folder.active = true;
    this.folderSelected.emit(folder);
  }
  
}
