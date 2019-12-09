import { Injectable } from '@angular/core';
import { Observable, of, empty, Subscription, forkJoin } from 'rxjs';
import { Percurso } from 'src/app/shared/models/percurso';
import { Linha } from 'src/app/shared/models/linha';
import { FeatureCollection } from 'geojson';
import { map, filter, flatMap, tap } from 'rxjs/operators';
import { FeatureLayer } from 'src/app/shared/models/feature-layer';
import { Feature } from 'src/app/shared/models/feature';
import { PercursoService } from 'src/app/shared/services/percurso.service';
import * as GeoJson from 'geojson';
import { ParadaService } from 'src/app/shared/services/parada.service';
import { ParadaFeatureShape } from 'src/app/shared/models/parada-feature-shape';
import { OperacaoService } from 'src/app/shared/services/operacao.service';
import { GrupoHorario } from 'src/app/shared/models/grupo-horario';
import { LineString } from 'src/app/shared/util/linestring';
import { CacheableObservable } from 'src/app/shared/util/cacheable-observable';

@Injectable()
export class LinhaStateService {

    constructor(private percursoService: PercursoService, private paradaService: ParadaService, private operacaoService: OperacaoService) {}

    instanceState(percursoId: number): LinhaState {
        return new LinhaStateImpl(
            this.percursoService.obterPercursosByPercursoId(percursoId),
            new ParadaFetchImpl(this.paradaService),
            new OperacaoFetchImpl(this.operacaoService)
        );
    }

}

export interface LinhaState {
    linha(): Observable<Linha>;
    percursoSelecionado(): Observable<Percurso>;
    operacao(): Observable<PercursoOperacao>;
    setPercurso(sentido: string): void;
    sentidos(): Observable<string[]>;
    featureLayer(): Observable<FeatureLayer>;
    paradasFeatureLayer(): Observable<FeatureLayer>;
    subscribeForPercursoLayerChange(listener: (fl: FeatureLayer) => void): void;
    subscribeForParadasLayerChange(listener: (fl: FeatureLayer) => void): void;
    subscribeForPercursoChange(listener: (percurso: Percurso) => void): void;
    selecionarByPercursoId(id: number): void;
    unsubscribeCurrentLoad(): void;
}

export interface PercursoOperacao {
    linha: Linha;
    origem: string;
    extensao: number;
    gruposHorarios: GrupoHorario[]
}

class LinhaStateImpl implements LinhaState {

    private percurso: Observable<GeoJson.Feature<GeoJson.LineString, Percurso>>;
    private percursoOperacao: Observable<PercursoOperacao>;

    private percursoChangeListener: (percurso: Percurso) => void;
    private percursoLayerChangeListener: (fl: FeatureLayer) => void;
    private paradasLayerChangeListener: (fl: FeatureLayer) => void;
    private percursos: Observable<FeatureCollection<GeoJson.LineString, Percurso>>;
    private _loadSubscription: Subscription = null;
    private _selectSubscription: Subscription = null;

    constructor(percursos: Observable<FeatureCollection<GeoJson.LineString, Percurso>>, private paradaFetch: ParadaFetch, private operacaoFetch: OperacaoFetch) {
        this.percursos = new CacheableObservable(percursos);
    }

    subscribeForPercursoLayerChange(listener: (fl: FeatureLayer) => void) {
        this.percursoLayerChangeListener = listener;
    }

    subscribeForParadasLayerChange(listener: (fl: FeatureLayer) => void) {
        this.paradasLayerChangeListener = listener;
    }

    subscribeForPercursoChange(listener: (percurso: Percurso) => void) {
        this.percursoChangeListener = listener;
    }

    linha(): Observable<Linha> {
        return this.percursoSelecionado().pipe(map(percurso => percurso.linha));
    }

    operacao(): Observable<PercursoOperacao> {
        return this.percursoOperacao ? this.percursoOperacao : empty();
    }

    percursoSelecionado(): Observable<Percurso> {
        return this.percurso ? this.percurso.pipe(map(f => f.properties)) : empty();
    }

    setPercurso(sentido: string) {
        this.percurso = this.percursos
            .pipe(flatMap(collection => collection.features))
            .pipe(filter(feature => feature.properties.sentido == sentido));

        this.percursoOperacao = this.percurso
            .pipe(flatMap(percurso => this.operacaoFetch.fetch(percurso.properties)
                .pipe(map(grupos => {
                    return {
                        percurso: percurso,
                        grupos: grupos
                    };
                }))
            )).pipe(map(pair => {
                return {
                    extensao: LineString.fromLinestring(pair.percurso.geometry).totalDistance(),
                    origem: pair.percurso.properties.origem,
                    linha: pair.percurso.properties.linha,
                    gruposHorarios: pair.grupos
                } as PercursoOperacao;
            }));

        
        this._loadSubscription = forkJoin([
            this.featureLayer(),
            this.paradasFeatureLayer(),
            this.percursoSelecionado()
        ]).subscribe(results => {
            if (this.percursoLayerChangeListener) {
                this.percursoLayerChangeListener(results[0]);
            }

            if (this.paradasLayerChangeListener) {
                this.paradasLayerChangeListener(results[1]);
            }

            if (this.percursoChangeListener) {
                this.percursoChangeListener(results[2]);
            }
        });
    }

    sentidos(): Observable<string[]> {
        return this.percursos.pipe(map(collection => collection.features
            .map(f => f.properties.sentido)
            .sort()));
    }

    featureLayer(): Observable<FeatureLayer> {
        return this.percurso.pipe(map(feature => FeatureLayer.fromFeatures([Feature.fromGeojson(feature)], {
            focusAffterAdd: true
        })));
    }

    paradasFeatureLayer(): Observable<FeatureLayer> {
        return this.percursoSelecionado()
            .pipe(flatMap(percurso => this.paradaFetch.fetch(percurso)))
            .pipe(map(collection => FeatureLayer.fromCollection(collection, {
                cluster: true,
                shape: new ParadaFeatureShape()
            })));
    }

    selecionarByPercursoId(id: number) {
        this._selectSubscription = this.percursos
            .pipe(flatMap(collection => collection.features.map(f => f.properties)))
            .pipe(filter(percurso => percurso.id == id))
            .subscribe(percurso => this.setPercurso(percurso.sentido));
    }

    unsubscribeCurrentLoad() {
        [this._loadSubscription, this._selectSubscription]
            .filter(s => s != null)
            .forEach(s => s.unsubscribe());
    }

}

interface ParadaFetch {
    fetch(percurso: Percurso): Observable<FeatureCollection>;
}

interface OperacaoFetch {
    fetch(percurso: Percurso): Observable<GrupoHorario[]>;
}

class ParadaFetchImpl implements ParadaFetch {
    private cacheMap: Map<number, FeatureCollection> = new Map();

    constructor(private paradaService: ParadaService) {}

    fetch(percurso: Percurso): Observable<FeatureCollection> {
        return this.cacheMap.has(percurso.id) ? of(this.cacheMap.get(percurso.id)) : this.fetchFromService(percurso);
    }

    private fetchFromService(percurso: Percurso): Observable<FeatureCollection> {
        return this.paradaService.obterFeatureCollectionByPercurso(percurso)
            .pipe(tap(collection => this.cacheMap.set(percurso.id, collection)));
    }
}

class OperacaoFetchImpl implements OperacaoFetch {
    private cacheMap: Map<number, GrupoHorario[]> = new Map();

    constructor(private operacaoService: OperacaoService) {}

    fetch(percurso: Percurso): Observable<GrupoHorario[]> {
        return this.cacheMap.has(percurso.id) ? of(this.cacheMap.get(percurso.id)) : this.fetchFromService(percurso);
    }

    private fetchFromService(percurso: Percurso): Observable<GrupoHorario[]> {
        return this.operacaoService.obterOperacoesByPercurso(percurso)
            .pipe(tap(operacoes => this.cacheMap.set(percurso.id, operacoes)));
    }
}