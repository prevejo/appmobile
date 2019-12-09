import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as UUIDv4 from 'uuid/v4';
import { APP_CONFIG, AppConfig } from 'src/app/core/services/app-config.service';
import { Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { PointLocation } from '../models/point-location';

@Injectable({
    providedIn: 'root'
})
export class LocationsService {

    private api: string;

    constructor(private http: HttpClient, @Inject(APP_CONFIG) appConfig: AppConfig) {
        this.api = appConfig.apiUrl;
    }

    public search(value: string, session_id: string): Observable<LocationSearchResult[]> {
        if (value.length == 0) {
            return of([]);
        }

        return this.http.get(this.api + '/places/search/' + value + '/' + session_id)
            .pipe(map(obj => {
                const results: LocationSearchResult[] = obj as Array<LocationSearchResult>;

                results.forEach(result => result.session_id = session_id);

                return results.filter(r => r.title != null);
            }));
    }

    public detail(location: LocationSearchResult): Observable<Location> {
        return this.http.get(this.api + '/places/detail/' + location.id + '/' + location.session_id)
            .pipe(map(obj => {
                return obj as Location;
            }));
    }

    public createSession(): LocationsSession {
        let service = this;

        return {
            session_id: UUIDv4(),
            search(value: string): Observable<LocationSearchResult[]> { return service.search(value, this.session_id); },
            detail(location: LocationSearchResult): Observable<Location> { return service.detail(location); }
        };
    }

}

export interface LocationsSession {
    session_id: string;
    search(value: string): Observable<LocationSearchResult[]>;
    detail(location: LocationSearchResult): Observable<Location>;
}

export interface LocationSearchResult {
    id: string;
    title: Title;
    session_id: string;
}

interface Title {
    description: string
}

export interface Location {
    name: string,
    location: PointLocation
}