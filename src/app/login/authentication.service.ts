import { Injectable } from '@angular/core';

import { User } from '../shared/models';
import { GoogleApiService } from '../shared/google/google-api.service';
import GoogleUser = gapi.auth2.GoogleUser;

@Injectable()
export class AuthenticationService {
  
  private static SESSION_STORAGE_ID = 'ng2-gmail-token';
  
  private user: User;
  
  public static getToken (): string {
    return sessionStorage.getItem(AuthenticationService.SESSION_STORAGE_ID);
  }
  
  public static signOut (): void {
    sessionStorage.removeItem(AuthenticationService.SESSION_STORAGE_ID);
  }
  
  constructor (
    private gapiService: GoogleApiService
  ) {
    this.loadGoogleApiAuthLib().then();
  }
  
  private async loadGoogleApiAuthLib (): Promise<void> {
    await this.gapiService.loadGoogleAuthApi().then();
  }
  
  /**
   * Authenticate user.
   * Save object that contains methos for labels, messages and such in service's property.
   * @returns {Promise<void>}
   */
  public async authenticate (): Promise<void> {
    
    if (!this.gapiService.getGoogleAuth()) {
      await this.gapiService.loadGoogleAuthApi();
    }
    
    const auth = this.gapiService.getGoogleAuth();
    
    await auth.signIn()
      .then(
        (user: GoogleUser) => {
          this.signInSuccessHandler(user);
        });
    
    console.log('authentication');
  }
  
  private signInSuccessHandler (user: GoogleUser): void {
    console.log('signIn user', user);
    
    this.user = this.parseUser(user);
    
    sessionStorage.setItem(
      AuthenticationService.SESSION_STORAGE_ID,
      this.user.accessToken
    );
  }
  
  private parseUser(user: GoogleUser): User {
    const userProfile = user.getBasicProfile();
    
    return <User>{
      name: userProfile.getName(),
      avatarUrl: userProfile.getImageUrl(),
      email: userProfile.getEmail(),
      accessToken: user.getAuthResponse().access_token
    };
  }
  
  public getUser(): User {
    return this.user;
  }
  
  
}
