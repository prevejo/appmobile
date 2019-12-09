import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'toUpperFirst'})
export class ToUpperFirstPipe implements PipeTransform {

    transform(value: string): string {
        if (value.length == 0) {
            return value;
        }

        return value.substr(0,1).toUpperCase() + value.substr(1).toLowerCase();
    }

}