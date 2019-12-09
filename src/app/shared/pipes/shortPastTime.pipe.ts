import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'shortPastTime'})
export class ShortPastTimePipe implements PipeTransform {

    transform(date: Date): string {
        if (date) {
            const milli = new Date().getTime() - date.getTime();

            if (milli < 0) {
                return '';
            } else if (milli === 0) {
                return 'agora';
            }

            const seconds = parseInt(String(milli / 1000));
            const minutes = parseInt(String(seconds / 60));
            const hours = parseInt(String(minutes / 60));
            const days = parseInt(String(hours / 60));

            if (days > 0) {
                return days + (days === 1 ? ' dia' : ' dias');
            }

            if (hours > 0) {
                return hours + ' h';
            }

            if (minutes > 0) {
                return minutes + ' min';
            }

            return seconds + ' sec';
        }

        return '';
    }

}
