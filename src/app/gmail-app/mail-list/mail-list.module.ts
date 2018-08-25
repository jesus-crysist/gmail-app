import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailListComponent } from './mail-list.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MailViewModule } from '../mail-view/mail-view.module';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    
    MailViewModule
  ],
  declarations: [ MailListComponent ],
  exports: [ MailListComponent ]
})
export class MailListModule {
}
