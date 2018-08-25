import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GoogleClientService } from './google-client.service';
import { GoogleApiService } from './google-api.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [ GoogleClientService, GoogleApiService ]
})
export class GoogleModule {
}
