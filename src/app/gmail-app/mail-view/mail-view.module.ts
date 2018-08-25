import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailViewComponent } from './mail-view.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ MailViewComponent ],
  exports: [ MailViewComponent ]
})
export class MailViewModule {
}
