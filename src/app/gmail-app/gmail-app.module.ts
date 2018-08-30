import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GmailAppComponent } from './gmail-app.component';
import { GoogleModule } from '../shared/google';
import { LoginModule } from '../login';
import { NavigationModule } from './navigation/navigation.module';
import { LabelSidebarModule } from './label-sidebar/label-sidebar.module';
import { MailListModule } from './mail-list/mail-list.module';
import { MailFormModalModule } from './mail-form-modal/mail-form-modal.module';

@NgModule({
  imports: [
    CommonModule,
    
    GoogleModule,
    LoginModule,
    
    NavigationModule,
    LabelSidebarModule,
    MailListModule,
    MailFormModalModule
  ],
  declarations: [ GmailAppComponent ]
})
export class GmailAppModule {
}
