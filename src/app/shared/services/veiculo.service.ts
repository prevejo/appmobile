import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from 'src/app/core/services/app-config.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Percurso } from '../models/percurso';
import { VeiculoOperacao } from '../models/veiculo-operacao';

@Injectable({
    providedIn: 'root'
})
export class VeiculoService implements VeiculoProvider {

    private api: string;

    constructor(private http: HttpClient, @Inject(APP_CONFIG) appConfig: AppConfig) {
        this.api = appConfig.apiUrl;
    }

    obterVeiculos(percurso: Percurso): Observable<VeiculoOperacao[]> {
        return this.http.get(this.api + '/rastreamento/veiculos/percurso/' + percurso.linha.numero + '/' + percurso.sentido)
            .pipe(map(resp => resp as VeiculoOperacao[]));
    }

}

export interface VeiculoProvider {
    obterVeiculos(percurso: Percurso): Observable<VeiculoOperacao[]>;
}
