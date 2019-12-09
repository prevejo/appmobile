import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'toDate'})
export class ToDatePipe implements PipeTransform {

    transform(date: string): Date {
        if (date) {
            return new Date(date);
        }

        return null;
    }

}
