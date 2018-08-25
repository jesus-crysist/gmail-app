import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { GoogleModule } from './google';
import { EmailValidatorDirective } from './email-validator.directive';


@NgModule({
    imports: [
        CommonModule,
        // NgbModule,
        GoogleModule
    ],
    declarations: [ EmailValidatorDirective ],
    exports: [ EmailValidatorDirective ]
})
export class SharedModule {
}
