import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from 'src/app/core/services/app-config.service';
import { map, tap, first, flatMap } from 'rxjs/operators';
import { FeatureCollection } from 'geojson';
import { Observable, concat, of } from 'rxjs';
import { Percurso } from '../models/percurso';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Injectable({
    providedIn: 'root'
})
export class ParadaService {

    private api: string;
    
    constructor(private http: HttpClient, @Inject(APP_CONFIG) appConfig: AppConfig, private storage: LocalStorageService) {
        this.api = appConfig.apiUrl;
    }

    obterFeatureCollection(): Observable<FeatureCollection> {
        const key: string = 'paradas_feature';

        const fromService = this.http.get(this.api + '/parada/collection')
            .pipe(map(resp => resp as FeatureCollection))
            .pipe(tap(fc => this.storage.store(key, fc)));

        return concat(
            this.storage.retrive('paradas_feature')
                .pipe(flatMap(sd => sd.isOutdatedInDays(3) ? fromService : of(sd.data as FeatureCollection))),
            fromService
        ).pipe(first());
    }

    obterFeatureCollectionByPercurso(percurso: Percurso): Observable<FeatureCollection> {
        return this.http.get(this.api + '/parada/collection/percurso/' + percurso.id)
            .pipe(map(resp => resp as FeatureCollection));
    }
    
}