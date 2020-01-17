import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APP_CONFIG, AppConfig } from 'src/app/core/services/app-config.service';
import { map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Percurso } from '../models/percurso';
import { FeatureProvider } from '../models/feature-provider';
import { Feature } from '../models/feature';
import { FeatureCollection, LineString } from 'geojson';

@Injectable({
    providedIn: 'root'
})
export class PercursoService {

    private api: string;
    
    constructor(private http: HttpClient, @Inject(APP_CONFIG) appConfig: AppConfig) {
        this.api = appConfig.apiUrl;
    }

    obterFeature(id: number): Observable<GeoJSON.Feature> {
        return this.http.get(this.api + '/percurso/feature/' + id)
            .pipe(map(resp => resp as GeoJSON.Feature<LineString>));
    }

    obterPercursosByDescricao(descricao: string): Observable<Percurso[]> {
        descricao = descricao.replace(/\//gi, '%26%2347%3B');

        return this.http.get(this.api + '/percurso/search/' + descricao)
            .pipe(map(resp => resp as Percurso[]));
    }

    obterPercursosByPercursoId(id: number): Observable<FeatureCollection<LineString, Percurso>> {
        return this.http.get(this.api + '/percurso/collection/' + id)
            .pipe(map(resp => resp as GeoJSON.FeatureCollection<LineString, Percurso>));
    }

    obterPercursosByParadaCod(cod: string): Observable<Percurso[]> {
        return this.http.get(this.api + '/percurso/parada/' + cod)
            .pipe(map(resp => resp as Percurso[]));
    }

    toFeatureProvider(): FeatureProvider<Percurso> {
        return new CachablePercursoFeatureProviderImpl(this);
    }

}

class CachablePercursoFeatureProviderImpl implements FeatureProvider<Percurso> {

    private cacheMap: Map<Number, Feature> = new Map();

    constructor(private service: PercursoService) {}
    
    getFeature(entity: Percurso): Observable<Feature> {
        if (this.cacheMap.has(entity.id)) {
            return of(this.cacheMap.get(entity.id));
        }

        return this.service.obterFeature(entity.id)
            .pipe(map(geoJsonFeature => Feature.fromGeojson(geoJsonFeature)))
            .pipe(tap(feature => this.cacheMap.set(entity.id, feature)));
    }

}