import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent, AuthGuard } from './login';
import { GmailAppComponent } from './gmail-app/gmail-app.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: GmailAppComponent, canActivate: [ AuthGuard ] },
  
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];


@NgModule({
  exports: [ RouterModule ],
  imports: [ RouterModule.forRoot(routes) ]
})
export class AppRoutingModule {
}
