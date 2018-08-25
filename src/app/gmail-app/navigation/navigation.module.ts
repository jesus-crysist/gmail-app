import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './navigation.component';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  
    NgbDropdownModule
  ],
  declarations: [ NavigationComponent ],
  exports: [ NavigationComponent ]
})
export class NavigationModule { }
