import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from 'src/app/core/services/app-config.service';
import { Observable } from 'rxjs';
import { Percurso } from '../models/percurso';
import { Parada } from '../models/parada';
import { map } from 'rxjs/operators';
import { EstimativaPercurso } from '../models/estimativa-percurso';

@Injectable({
    providedIn: 'root'
})
export class PrevisaoService implements EstimativaPercursoProvider {

    private api: string;

    constructor(private http: HttpClient, @Inject(APP_CONFIG) appConfig: AppConfig) {
        this.api = appConfig.apiUrl;
    }

    obterEstimativa(percurso: Percurso, embarque: Parada): Observable<EstimativaPercurso> {
        return this.http.get(this.api + '/estimativa/percurso/' + percurso.linha.numero + '/' + percurso.sentido + '/' + embarque.cod)
            .pipe(map(resp => resp as EstimativaPercurso));
    }

}


export interface EstimativaPercursoProvider {

    obterEstimativa(percurso: Percurso, embarque: Parada): Observable<EstimativaPercurso>;

}