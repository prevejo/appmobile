import { Injectable, Inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from 'src/app/core/services/app-config.service';
import { Observable } from 'rxjs';
import { Comentario } from './comentario.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TopicoService {

    private api: string;

    constructor(private http: HttpClient, @Inject(APP_CONFIG) appConfig: AppConfig) {
        this.api = appConfig.apiUrl;
    }

    obterTopicosAtualizados(): Observable<TopicoAtualizado[]> {
        return this.http.get(this.api + '/topico/atualizados')
            .pipe(map(resp => resp as TopicoAtualizado[]));
    }

    obterTopicoAtualizado(topicoId: number): Observable<TopicoAtualizado> {
        return this.http.get(this.api + '/topico/atualizados/' + topicoId)
            .pipe(map(resp => resp as TopicoAtualizado));
    }
}


export interface TopicoAtualizado {
    topico: Topico;
    ultimosComentarios: Comentario[];
}

export interface Topico {
    id: number;
    titulo: string;
}
