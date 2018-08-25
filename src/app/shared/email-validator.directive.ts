import { ValidateFn } from 'codelyzer/walkerFactory/walkerFn';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';
import { Directive } from '@angular/core';

/**
 * Custom e-mail address validator.
 *
 * @returns {ValidateFn}
 */
export function emailValidator () {

    const email: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    // /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)
    // +[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

    return (control: AbstractControl): any => {
        const valid = email.test(control.value);
        console.log(valid);
        return !valid ? { 'email': { value: control.value } } : null;
    };

}


@Directive({
    selector: '[app-email-validator]',
    providers: [ { provide: NG_VALIDATORS, useExisting: EmailValidatorDirective, multi: true } ]
})
export class EmailValidatorDirective implements Validator {

    validate (control: AbstractControl): any {
        const validator = emailValidator();
        return validator(control);
    }
}
