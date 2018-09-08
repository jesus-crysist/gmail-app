import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from './authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.css' ]
})
export class LoginComponent {
  
  private error: string;
  
  constructor (private router: Router, private authService: AuthenticationService) {
  }
  
  login (): void {
    this.authService.authenticate()
      .then(
        () => this.router.navigate([ '/' ]),
        (error) => this.error = error
      );
  }
}
