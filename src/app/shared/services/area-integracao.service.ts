import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from 'src/app/core/services/app-config.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AreaIntegracao } from '../models/area-integracao';
import { FeatureCollection } from 'geojson';

@Injectable({
    providedIn: 'root'
})
export class AreaIntegracaoService {

    private api: string;
    
    constructor(private http: HttpClient, @Inject(APP_CONFIG) appConfig: AppConfig) {
        this.api = appConfig.apiUrl;
    }

    obterFeatureCollection(areasIntegracao: AreaIntegracao[]): Observable<FeatureCollection> {
        return this.http.get(this.api + '/areaintegracao/collection/' + areasIntegracao.map(area => area.id).join('_'))
            .pipe(map(resp => {
                const fc: FeatureCollection = resp as FeatureCollection;

                return fc;
            }));
    }

}