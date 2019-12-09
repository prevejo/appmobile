import { Injectable } from '@angular/core';
import { Observable, of, empty, throwError, concat } from 'rxjs';
import { flatMap, first, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {

    store<T>(key: string, data: T): Observable<T> {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            this.storeStorageDate(key);
        } catch(e) {
            return throwError('Erro ao armazenar valor');
        }

        return of(data);
    }

    retriveAndStore<T>(key: string, updateFunction: (data: T) => T): Observable<T> {
        return concat(
            this.retrive(key).pipe(map(sd => sd.data as T)),
            of(null)
        ).pipe(first())
        .pipe(map(data => updateFunction(data)))
        .pipe(flatMap(result => this.store(key, result)));
    }

    retrive(key: string): Observable<StoragedData> {
        return of(key)
            .pipe(flatMap(key => {
                const val: any = localStorage.getItem(key);

                if (val == null) {
                    return empty();
                }

                try {
                    return of(new StoragedDataImpl(this.findStorageDate(key), JSON.parse(val)));
                } catch(e) {
                    return throwError('Erro ao obter valor armazenado');
                }
            }));
    }

    private storeStorageDate(key: string) {
        localStorage.setItem(key + '_date', JSON.stringify(new Date().getTime()));
    }

    private findStorageDate(key: string): Date {
        const val: any = localStorage.getItem(key + '_date');

        return val ? new Date(JSON.parse(val)) : null;
    }

}

export interface StoragedData {

    date: Date;
    data: any;

    isOutdatedInDays(days: number): boolean;

}

class StoragedDataImpl implements StoragedData {

    constructor(public date: Date, public data: any) {}

    isOutdatedInDays(days: number): boolean {
        if (this.date == undefined || this.date == null) {
            return true;
        }

        const currentTime: number = new Date().getTime();
        const dataTime: number = this.date.getTime();
        const daysTime: number = 1000 * 60 * 60 * 24 * days;

        return currentTime - dataTime >= daysTime;
    }

}