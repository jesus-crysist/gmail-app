import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthGuard implements CanActivate {
  
  constructor (private router: Router) {
  }
  
  canActivate (): boolean {
    if (AuthenticationService.getToken()) {
      // logged in so return tru
      return true;
    }
    
    // not logged in so redirect to login page
    this.router.navigate([ '/login' ]);
    return false;
  }
  
}
