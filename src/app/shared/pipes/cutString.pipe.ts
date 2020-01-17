import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'cutString'})
export class CutStringPipe implements PipeTransform {

    transform(str: string, limit?: number): string {
        if (str == undefined || str == null || str.length <= limit) {
            return str;
        }

        return str.slice(0, limit) + '...';
    }

}
