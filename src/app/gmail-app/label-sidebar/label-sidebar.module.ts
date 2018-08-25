import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabelSidebarComponent } from './label-sidebar.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ LabelSidebarComponent ],
  exports: [ LabelSidebarComponent ]
})
export class LabelSidebarModule {
}
