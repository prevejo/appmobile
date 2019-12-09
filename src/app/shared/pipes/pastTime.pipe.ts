import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'pastTime'})
export class PastTimePipe implements PipeTransform {

    transform(date: Date): string {
        if (date) {
            const milli = new Date().getTime() - date.getTime();

            if (milli < 0) {
                return '';
            } else if (milli === 0) {
                return 'agora';
            }

            const seconds = parseInt(String(milli / 1000));

            if (seconds < 1) {
                return 'agora';
            }

            let time = '';

            if (seconds % 60 !== 0) {
                time = seconds % 60 + 'sec';
            }

            const minutes = parseInt(String(seconds / 60));

            if (minutes >= 1 && minutes % 60 !== 0) {
                time = parseInt(String(minutes % 60)) + 'min ' + time;
            }

            const hours = parseInt(String(minutes / 60));

            if (hours >= 1) {
                time = hours + 'h ' + time;
            }

            return time;
        }

        return '';
    }

}
