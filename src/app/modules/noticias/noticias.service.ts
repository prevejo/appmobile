import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from 'src/app/core/services/app-config.service';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class NoticiasService implements NoticiasProvider {

    private api: string;

    constructor(private http: HttpClient, @Inject(APP_CONFIG) appConfig: AppConfig) {
        this.api = appConfig.apiUrl;
    }

    obterLastOnes(): Observable<Noticia[]> {
        return this.http.get(this.api + '/informativo/last')
            .pipe(map(resp => resp as Noticia[]));
    }

    obterNoticia(id: number): Observable<Noticia> {
        return this.http.get(this.api + '/informativo/' + id)
            .pipe(map(resp => resp as Noticia));
    }

    fetchLastOnes(): Observable<Noticia[]> {
        return this.http.get(this.api + '/informativo/last')
            .pipe(map(resp => resp as Noticia[]));
    }

    fetchLastOnesStartingFrom(date: Date): Observable<Noticia[]> {
        return this.http.get(this.api + '/informativo/last/' + date.toISOString())
            .pipe(map(resp => resp as Noticia[]));
    }

}

export interface NoticiasProvider {

    fetchLastOnes(): Observable<Noticia[]>;
    fetchLastOnesStartingFrom(date: Date): Observable<Noticia[]>;

}

export interface Noticia {

    id: number;
    titulo: string;
    resumo: string;
    endereco: string;
    dtPublicacao: string;

}
