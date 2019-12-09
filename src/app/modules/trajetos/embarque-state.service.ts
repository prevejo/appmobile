import { PrevisaoService, EstimativaPercursoProvider } from 'src/app/shared/services/previsao.service';
import { Injectable } from '@angular/core';
import { Parada } from 'src/app/shared/models/parada';
import { Percurso } from 'src/app/shared/models/percurso';
import { Observable, interval, Subscription, Subject, concat, of } from 'rxjs';
import { FeatureLayer } from 'src/app/shared/models/feature-layer';
import { map, tap, publishReplay, refCount, sampleTime } from 'rxjs/operators';
import { EstimativaEmbarque } from 'src/app/shared/models/estimativa-percurso';
import { Feature } from 'src/app/shared/models/feature';
import { PointFeatureShape } from 'src/app/shared/models/point-feature-shape';
import * as GeoJSON from 'geojson';
import { ShapeColor } from 'src/app/shared/models/parada-feature-shape';
import { BusFeatureShape } from 'src/app/shared/models/bus-feature-shape';
import { StartPointFeatureShape } from 'src/app/shared/models/start-point-feature-shape';
import { Veiculo } from 'src/app/shared/models/instante-veiculo';
import { TrechoEstimativaProperties } from 'src/app/shared/models/veiculo-operacao';

@Injectable()
export class EmbarqueStateService {

    constructor(private previsaoService: PrevisaoService) {}

    instanceState(embarques: { percurso: Percurso, embarque: Parada }[], updateIntervalMilli: number): EmbarqueState {
        const es = new EmbarqueStateImpl(this.previsaoService, updateIntervalMilli)
        embarques.forEach(emb => es.addEmbarque(emb.percurso, emb.embarque));
        return es;
    }

}

export interface EmbarqueState {

    embarqueCollection: EmbarqueCollection;

    addEmbarque(percurso: Percurso, embarque: Parada): void;
    updateAll(): void;
    requestIntervalUpdate(): Subscription;
    isLoading(): boolean;
    percursos(): PercursoEmbarqueState[];

}

class EmbarqueStateImpl implements EmbarqueState {
    MAX_EMBARQUES = 10;

    private embarques: Embarque[] = [];

    private embarquesMap: Map<PercursoEmbarqueState, Embarque[]> = new Map();
    private embarquesStates: PercursoEmbarqueState[] = [];
    private embarques$: Subject<Embarque[]> = new Subject();
    private intervalObs$: Observable<number>;
    private intervalSubscriptions: Subscription[] = [];

    embarqueCollection = new EmbarqueCollectionImpl(this.embarques$);

    constructor(private estimativaProvider: EstimativaPercursoProvider, updateIntervalMilli: number) {
        this.intervalObs$ = this.createUpdateInterval(updateIntervalMilli);
    }

    addEmbarque(percurso: Percurso, embarque: Parada): void {
        const percEmbarque = new PercursoEmbarqueStateImpl(
            percurso, embarque, this.estimativaProvider,
            (pe, embs) => this.onLoadPercursoEmbarque(pe, embs)
        );
        this.embarquesStates.push(percEmbarque);
    }

    percursos(): PercursoEmbarqueState[] {
        return this.embarquesStates;
    }

    updateAll(): void {
        this.embarquesStates.forEach(es => es.update());
    }

    requestIntervalUpdate(): Subscription {
        const sub: Subscription = this.intervalObs$.subscribe();
        this.intervalSubscriptions.push(sub);
        sub.add(() => {
            const index = this.intervalSubscriptions.indexOf(sub);
            if (index != -1) {
                this.intervalSubscriptions.splice(index, 1);
            }

            if (this.intervalSubscriptions.length == 0) {
                this.stopAllUpdates();
            }
        });
        return sub;
    }

    isLoading(): boolean {
        return this.embarquesStates.filter(es => es.isLoading()).length > 0;
    }

    private stopAllUpdates() {
        this.embarquesStates.forEach(es => es.stopCurrentLoad());
    }

    private onIntervalUpdate(): void {
        this.updateAll();
    }

    private createUpdateInterval(updateIntervalMilli: number): Observable<number> {
        return concat(of(1), interval(updateIntervalMilli))
            .pipe(tap(() => this.onIntervalUpdate()))
            .pipe(publishReplay(1), refCount());
    }

    private onLoadPercursoEmbarque(percurso: PercursoEmbarqueState, embarques: Embarque[]) {
        const currentEmbarques: Embarque[] = this.embarquesMap.get(percurso);

        if (currentEmbarques && currentEmbarques.length == 0 && embarques.length == 0) {
            return;
        }

        this.embarquesMap.set(percurso, embarques);

        this.setEmbarques(Array.from(this.embarquesMap.values())
            .reduce((prev, next) => prev.concat(next), []));
    }

    private setEmbarques(embarques: Embarque[]) {
        if (embarques.length == 0) {
            return;
        }

        this.embarques = embarques.length > 6
            ? embarques.filter(emb => emb.tempoRestante <= 100)
            : embarques;

        this.embarques.sort((a, b) => 
            a.tempoRestante == b.tempoRestante ? 0 : 
            a.tempoRestante > b.tempoRestante ? 1 : -1);

        if (this.embarques.length > this.MAX_EMBARQUES) {
            this.embarques = this.embarques.slice(0, this.MAX_EMBARQUES);
        }

        this.embarques$.next(this.embarques);
    }
}

export interface PercursoEmbarqueState {

    percurso: Percurso;
    pontoEmbarque: Parada;
    isLoading(): boolean;
    update(): Observable<Embarque[]>;
    stopCurrentLoad(): void;

}

class PercursoEmbarqueStateImpl implements PercursoEmbarqueState {

    private currentLoad: Observable<Embarque[]> = null;
    private currentLoadSubscription: Subscription;

    constructor(
        public percurso: Percurso,
        public pontoEmbarque: Parada,
        private estimativaProvider: EstimativaPercursoProvider,
        private loadListener: (percEmbarque: PercursoEmbarqueState, embarques: Embarque[]) => void) {}

    isLoading(): boolean {
        return this.currentLoad != null;
    }

    update(): Observable<Embarque[]> {
        let load = this.currentLoad;

        if (load == null) {
            load = this.currentLoad = this.estimativaProvider.obterEstimativa(this.percurso, this.pontoEmbarque)
                .pipe(map(ep => ep.chegadas.map(chegada => new EmbarqueImpl(ep.endPoint, ep.percurso, chegada))))
                .pipe(tap(() => this.currentLoad = null));

            this.currentLoadSubscription = load.subscribe(embarques => this.loadListener(this, embarques));
        }

        return load;
    }

    stopCurrentLoad() {
        if (this.currentLoadSubscription) {
            this.currentLoadSubscription.unsubscribe();
            this.currentLoad = null;
        }
    }
}


export interface Embarque {

    parada: Parada;
    percurso: Percurso;
    veiculo: Veiculo;
    distanciaRestante: number;
    tempoRestante: number;
    horaPrevista: Date;

    toFeatureLayer(): FeatureLayer;
    getTrechoFeature(): Feature;
    getVeiculoFeature(): Feature;
    getTrechoDistance(): number;

}

class EmbarqueImpl implements Embarque {

    public veiculo: Veiculo;
    public distanciaRestante: number;
    public tempoRestante: number;
    public horaPrevista: Date;

    constructor(public parada: Parada, public percurso: Percurso, private estimativaEmbarque: EstimativaEmbarque) {
        this.veiculo = estimativaEmbarque.startPoint.veiculo;
        this.distanciaRestante = estimativaEmbarque.distancia;
        this.tempoRestante = estimativaEmbarque.duracao;
        this.horaPrevista = new Date(estimativaEmbarque.horaPrevista);
    }

    toFeatureLayer(): FeatureLayer {
        const features: Feature[] = [];

        if (this.estimativaEmbarque.trecho) {
            const feature: GeoJSON.Feature = this.estimativaEmbarque.trecho.features
                .filter(f => f.properties.position == 'middle')[0];

            if (feature != undefined) {
                features.push(Feature.fromGeojson(feature));
            }
        }

        features.push(Feature.fromGeoPoint(this.estimativaEmbarque.startPoint.instante.localizacao));

        features.push(Feature.fromGeoPoint(this.parada.geo));

        return FeatureLayer.fromFeatures(features, {
            shape: new PointFeatureShape()
        });
    }

    getVeiculoFeature(): Feature {
        return Feature.fromGeoPoint(this.estimativaEmbarque.startPoint.instante.localizacao);
    }

    getTrechoFeature(): Feature {
        if (this.estimativaEmbarque.trecho) {
            const feature: GeoJSON.Feature = this.estimativaEmbarque.trecho.features
                .filter(f => f.properties.position == 'middle')[0];

            if (feature != undefined) {
                return Feature.fromGeojson(feature);
            }
        }

        return null;
    }

    getTrechoDistance(): number {
        if (this.estimativaEmbarque.trecho) {
            const feature: GeoJSON.Feature<GeoJSON.Geometry, TrechoEstimativaProperties> =
                this.estimativaEmbarque.trecho.features
                .filter(f => f.properties.position == 'middle')[0];

            if (feature != undefined) {
                return feature.properties.distance;
            }
        }

        return null;
    }

}

export interface EmbarqueCollection {

    embarques: ColorfulEmbarque[];

    toFeaureLayer(): EmbarqueLayerCollection;
    embarquesObservable(): Observable<ColorfulEmbarque[]>;
    featureLayersObservable(): Observable<EmbarqueLayerCollection>;
    selecionarVeiculo(embarque: ColorfulEmbarque): void;
    isSelecionado(embarque: ColorfulEmbarque): boolean;

}

class EmbarqueCollectionImpl implements EmbarqueCollection {

    private colorList: ShapeColor[] = ["green", "orange", "red", "purple", "cadetblue", "blue", "darkred", "darkgreen", "darkpurple"];
    private colorIndex = 0;

    embarques: ColorfulEmbarque[] = [];
    private _subcription: Subscription;
    private embarques$: Observable<ColorfulEmbarque[]>;
    private featureLayers$: Observable<EmbarqueLayerCollection>;
    private dispatchSubject: Subject<EmbarqueCollection> = new Subject();

    private veiculosSelecionados: string[] = [];

    constructor(obs: Observable<Embarque[]>) {
        this._subcription = obs
            .pipe(sampleTime(2000))
            .subscribe(embs => {
                this.setEmbarques(embs);
                this.dispatchSubject.next(this);
            });

        this.embarques$ = this.dispatchSubject.pipe(map(collection => collection.embarques));
        this.featureLayers$ = this.dispatchSubject.pipe(map(collection => collection.toFeaureLayer()));
    }

    toFeaureLayer(): EmbarqueLayerCollection {
        const paradas = this.findParadas(this.embarques.map(emb => emb.embarque));

        const embarqueFeatureLayers = this.embarques.map(emb => {
            return {
                featureLayer: emb.toFeatureLayer(),
                distance: emb.embarque.getTrechoDistance() == null ? 100000000 : emb.embarque.getTrechoDistance(),
                embarque: emb
            };
        }).sort((a, b) => a.distance === b.distance ? 0 : a.distance < b.distance ? 1 : -1);

        return {
            paradasLayer: paradas.length ? this.buildFeatureLayerForParada(paradas) : null,
            embarques: embarqueFeatureLayers.map(emb => {
                return {
                    embarque: emb.embarque,
                    layer: emb.featureLayer,
                    selected: this.veiculosSelecionados.indexOf(emb.embarque.embarque.veiculo.numero) != -1
                };
            })
        } as EmbarqueLayerCollection;
    }

    embarquesObservable(): Observable<ColorfulEmbarque[]> {
        return this.embarques$;
    }

    featureLayersObservable(): Observable<EmbarqueLayerCollection> {
        return this.featureLayers$;
    }

    private setEmbarques(embarques: Embarque[]): EmbarqueCollection {
        this.colorIndex = 0;
        this.embarques = embarques.map(emb => {
                return {
                    embarque: emb,
                    distance: emb.getTrechoDistance() == null ? 100000000 : emb.getTrechoDistance()
                };
            }).sort((a, b) => a.distance === b.distance ? 0 : a.distance < b.distance ? -1 : 1)
            .map(emb => emb.embarque)
            .map(emb => new ColorfulEmbarqueImpl(emb, this.findColor(emb) as ShapeColor));

        return this;
    }

    selecionarVeiculo(embarque: ColorfulEmbarque) {
        const index = this.veiculosSelecionados.indexOf(embarque.embarque.veiculo.numero);

        if (index === -1) {
            this.veiculosSelecionados.push(embarque.embarque.veiculo.numero);
        } else {
            this.veiculosSelecionados.splice(index, 1);
        }

        this.dispatchSubject.next(this);
    }

    isSelecionado(embarque: ColorfulEmbarque): boolean {
        return this.veiculosSelecionados.indexOf(embarque.embarque.veiculo.numero) !== -1;
    }

    private buildFeatureLayerForParada(paradas: Parada[]): FeatureLayer {
        return FeatureLayer.fromFeatures(
            paradas.map(parada => Feature.fromGeoPoint(parada.geo)), {
                shape: new StartPointFeatureShape()
            }
        );
    }

    private findParadas(embarques: Embarque[]): Parada[] {
        const paradaMap: Map<string, Parada> = new Map();
        embarques.forEach(emb => paradaMap.set(emb.parada.cod, emb.parada));
        return Array.from(paradaMap.values());
    }

    private findColor(embarque: Embarque): string {
        return this.nextColor();
    }

    private nextColor(): string {
        if (this.colorIndex === this.colorList.length - 1) {
            this.colorIndex = 0;
        }

        return this.colorList[this.colorIndex++];
    }

}

export interface ColorfulEmbarque {

    embarque: Embarque;
    color: string;

    toFeatureLayer(): FeatureLayer;

}

class ColorfulEmbarqueImpl implements ColorfulEmbarque {

    constructor(public embarque: Embarque, public color: ShapeColor) {}

    toFeatureLayer(): FeatureLayer {
        return this.buildFeatureLayerForTrecho(this.embarque, this.color);
    }

    private buildFeatureLayerForTrecho(embarque: Embarque, color: ShapeColor): FeatureLayer {
        return FeatureLayer.fromFeatures([
            embarque.getTrechoFeature(),
            embarque.getVeiculoFeature()
        ].filter(v => v != null), {
            shape: new BusFeatureShape(color)
        });
    }

}

export interface EmbarqueLayerCollection {

    paradasLayer: FeatureLayer;
    embarques: {
        embarque: ColorfulEmbarque;
        layer: FeatureLayer;
        selected: boolean;
    }[];

}
