import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';
import { Directive } from '@angular/core';

@Directive({
    selector: '[app-email-validator]',
    providers: [ { provide: NG_VALIDATORS, useExisting: EmailValidatorDirective, multi: true } ]
})
export class EmailValidatorDirective implements Validator {
  
  private email: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    validate (control: AbstractControl): any {
      const valid = this.email.test(control.value);
      return !valid ? { 'email': { value: control.value } } : null;
    }
}
