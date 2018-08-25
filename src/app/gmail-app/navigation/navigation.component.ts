import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: [ './navigation.component.css' ]
})
export class NavigationComponent implements AfterViewInit {
  
  @Input() selectedFolder: string;
  @Input() loggedUser: string;
  @Input() userAvatar: string;
  
  @Output() search: EventEmitter<string>;
  @Output() compose: EventEmitter<void>;
  @Output() logout: EventEmitter<string>;
  
  @ViewChild('searchField') searchField: ElementRef;
  
  title = 'NgMail';
  
  constructor () {
    this.search = new EventEmitter<string>();
    this.compose = new EventEmitter<void>();
    this.logout = new EventEmitter<string>();
  }
  
  ngAfterViewInit () {
    
    fromEvent(this.searchField.nativeElement, 'keypress')
      .pipe(
        debounceTime(750),
        distinctUntilChanged(),
        map((keyEvent: KeyboardEvent) => keyEvent.srcElement)
      ).subscribe((element: HTMLInputElement) => {
      this.search.emit(element.value);
    });
    
  }
  
  composeNewMail (): void {
    this.compose.emit();
  }
  
  onLoggedOut () {
    this.logout.emit(this.loggedUser);
  }
  
}
