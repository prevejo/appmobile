import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from 'src/app/core/services/app-config.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Percurso } from '../models/percurso';
import { GrupoHorario, identifyGruposHorarios } from '../models/grupo-horario';
import { Operacao } from '../models/operacao';

@Injectable({
    providedIn: 'root'
})
export class OperacaoService {

    private api: string;
    
    constructor(private http: HttpClient, @Inject(APP_CONFIG) appConfig: AppConfig) {
        this.api = appConfig.apiUrl;
    }

    obterOperacoesByPercurso(percurso: Percurso): Observable<GrupoHorario[]> {
        return this.http.get(this.api + '/operacao/percurso/' + percurso.id)
            .pipe(map(resp => identifyGruposHorarios(resp as Operacao[])));
    }
    
}