import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MailFormModalComponent } from './mail-form-modal.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule
  ],
  declarations: [ MailFormModalComponent ],
  exports: [ MailFormModalComponent ]
})
export class MailFormModalModule {
}
