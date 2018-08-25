import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LoginModule } from './login';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app/app.component';
import { GmailAppModule } from './gmail-app/gmail-app.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    
    NgbModule,
    ToastrModule.forRoot(),
    
    AppRoutingModule,
    
    LoginModule,
    GmailAppModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
