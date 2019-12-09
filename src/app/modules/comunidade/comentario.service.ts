import { Injectable, Inject } from '@angular/core';
import { APP_CONFIG, AppConfig } from 'src/app/core/services/app-config.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Topico } from './topico.service';

@Injectable({
    providedIn: 'root'
})
export class ComentarioService implements ComentarioProvider {

    private api: string;

    constructor(private http: HttpClient, @Inject(APP_CONFIG) appConfig: AppConfig) {
        this.api = appConfig.apiUrl;
    }

    registrar(novoComentario: NovoComentario): Observable<Comentario> {
        return this.http.post(this.api + '/comentario/novo', JSON.stringify(novoComentario), {
            headers: new HttpHeaders({
                'Content-Type':  'application/json'
            })
        }).pipe(map(resp => resp as Comentario));
    }

    search(topico: Topico, value: string, maxResults: number): Observable<Comentario[]> {
        return this.http.get(this.api + '/comentario/search/' + topico.id + '/' + maxResults + '/' + value)
            .pipe(map(result => result as Comentario[]));
    }

    mostRecents(topico: Topico): Observable<Comentario[]> {
        return this.http.get(this.api + '/comentario/recents/' + topico.id)
            .pipe(map(result => result as Comentario[]));
    }

    incrementarRelevancia(comentario: Comentario): Observable<Comentario> {
        return this.http.get(this.api + '/comentario/relevancia/incrementar/' + comentario.id)
            .pipe(map(result => result as Comentario));
    }
}

export interface ComentarioProvider {

    search(topico: Topico, value: string, maxResults: number): Observable<Comentario[]>;
    mostRecents(topico: Topico): Observable<Comentario[]>;

}


export interface Comentario {
    id: number;
    assunto: string;
    comentario: string;
    relevancia: number;
    dtPublicacao: string;
}

export interface NovoComentario {
    topicoId: number;
    assunto: string;
    comentario: string;
}
