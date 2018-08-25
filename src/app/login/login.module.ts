import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { CommonModule } from '@angular/common';

import { LoginComponent } from './login.component';

import { AuthGuard } from './auth.guard';
import { AuthenticationService } from './authentication.service';

@NgModule({
  imports: [
    CommonModule,
    HttpModule
  ],
  declarations: [ LoginComponent ],
  providers: [ AuthGuard, AuthenticationService ]
})
export class LoginModule {
}
