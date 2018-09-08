import { Injectable } from '@angular/core';
import { GoogleApiConfig } from './google-api-config';
import GoogleAuth = gapi.auth2.GoogleAuth;

@Injectable()
export class GoogleApiService {
  
  private readonly gapiUrl: string = 'https://apis.google.com/js/api.js';
  private config: GoogleApiConfig = {
    discoveryDocs: [ 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest',
      'https://people.googleapis.com/$discovery/rest?version=v1' ],
    client_id: '1060923063605-1nv7fvl0qtmekamm65857chqu0buvu0h.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/plus.me https://mail.google.com/',
    ux_mode: 'popup'
  };
  
  private googleAuth: GoogleAuth;
  
  constructor () {
  }
  
    async loadApiFile (): Promise<void> {
      
      return new Promise<void>((resolve) => {
        const node = document.createElement('script');
        node.src = this.gapiUrl;
        node.type = 'text/javascript';
        node.charset = 'utf-8';
        document.getElementsByTagName('head')[ 0 ].appendChild(node);
        node.onload = () => {
          gapi.load('client', () => resolve());
        };
      });
    }
    
    async loadGoogleAuthApi (): Promise<void> {
      await this.loadApiFile().then();
      
      await new Promise((resolve) => gapi.load('auth2', resolve));
      this.googleAuth = gapi.auth2.init(this.config);
    }
  
  public getGoogleAuth (): GoogleAuth {
    return this.googleAuth;
  }
  
}
