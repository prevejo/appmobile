import { Component, OnInit } from '@angular/core';
import { TrajetoStateService, TrajetoState } from '../../trajeto-state-service';
import { Observable, concat, Subscription, Subject, ReplaySubject, forkJoin, EMPTY } from 'rxjs';
import { FeatureStateClient, FeatureState } from 'src/app/shared/components/map/feature-state';
import { tap, map, shareReplay} from 'rxjs/operators';
import { TrechoPercursoCollection } from 'src/app/shared/models/trecho-percurso-collection';
import { MapConfig } from 'src/app/shared/components/map/map-config';
import { ClientFeatureLayer } from 'src/app/shared/components/map/client-feature-layer';
import { Parada } from 'src/app/shared/models/parada';
import { Percurso } from 'src/app/shared/models/percurso';
import { Feature } from 'src/app/shared/models/feature';
import { Router } from '@angular/router';
import { FeatureEntity } from 'src/app/shared/models/feature-entity';
import { EmbarqueState, EmbarqueStateService, EmbarqueLayerCollection } from '../../embarque-state.service';
import { TrechoPercurso } from 'src/app/shared/models/trajeto';
import { RouteLocation } from 'src/app/shared/models/route-location';
import { FeatureCollection, Geometry } from 'geojson';
import { AlarmeEmbarqueService } from '../../alarme-embarque.service';

@Component({
    templateUrl: './detalhamento-trajeto.page.html',
    styleUrls: ['./detalhamento-trajeto.page.scss']
})
export class DetalhamentoTrajetoPage implements OnInit {

    public trajeto: TrajetoState;
    public featureState: FeatureStateClient = new FeatureState();
    public trechosCollection: Observable<TrechoPercursoCollection[]>;
    public mapConfig: MapConfig = {
        layersControlPosition: 'topleft',
        buttons: [{
            title: 'Exibir detalhes',
            icon: 'fa-ellipsis-v',
            position: 'bottomleft',
            clickFunction: () => this.lastDisabled.toggle(),
            styleMap: {
                width: '30px',
                height: '30px',
                fontSize: '16px',
                backgroundColor: 'rgb(56, 128, 255)',
                color: 'white',
            },
            containerStyleMap: {
                borderColor: 'rgb(56, 128, 255)'
            }
        }]
    };
    private lastDisabled: PanelControl;
    public detailButtonState: PanelControl = new PanelControlImpl(true, pc => this.lastDisabled = pc);
    public embarqueButtonState: PanelControl = new PanelControlImpl(false, pc => this.lastDisabled = pc);
    public embarqueState$: Subject<EmbarqueState> = new ReplaySubject(1);
    private _embarqueState$: Observable<EmbarqueState>;
    private currentEmbarqueState: EmbarqueState = null;
    private embarqueLoadStopped: boolean;
    private embarqueFeatureLayers: ClientFeatureLayer[] = [];
    private _embarqueLayersSubscription: Subscription = null;

    private embarqueStateUpdateInterval: Subscription = null;

    private trajetoLayersPanel: TrajetoLayersPanel;
    private loadSubscription: Subscription;

    constructor(
        private alertaService: AlarmeEmbarqueService,
        private trajetoStateService: TrajetoStateService,
        private router: Router,
        private embarqueStateService: EmbarqueStateService) {}

    ngOnInit() {
        this.trajetoStateService.consumeTrajetoSelecionadoState()
            .pipe(tap(trajeto => this.trajeto = trajeto))
            .subscribe(trajeto => this.loadTrajeto(trajeto));
    }

    private loadTrajeto(trajetoState: TrajetoState) {
        const layersPanel: Observable<TrajetoLayersPanel> = forkJoin([
            trajetoState.origem(),
            trajetoState.destino(),
            trajetoState.areasIntegracao(),
            trajetoState.linhas()
        ]).pipe(map(elements => new TrajetoLayersPanel(elements[0], elements[1], elements[2], elements[3])))
        .pipe(shareReplay({refCount: true, bufferSize: 1}));

        this.loadSubscription = layersPanel.subscribe(lp => {
            this.trajetoLayersPanel = lp;
            lp.addToFeatureState(this.featureState);
        });

        this.trechosCollection = layersPanel.pipe(map(lp => lp.trechos.map(trecho => trecho.getEntity())));

        this._embarqueState$ = layersPanel.pipe(map(lp => lp.trechoLayers))
            .pipe(map(trechoLayers => this.instanceEmbarqueState(trechoLayers)))
            .pipe(shareReplay());
    }

    onParadaSelected(event: {type: 'detail' | 'focus', parada: Parada}) {
        if (event.type === 'focus') {
            if (this.trajetoLayersPanel) {
                this.trajetoLayersPanel.focusFeature(f => f.getGeoJson().properties['codigo'] === event.parada.cod);
            }
        } else {
            this.router.navigate(['/trajetos/parada', event.parada.cod]);
        }
    }

    onPercursoSelected(event: {type: 'detail' | 'focus', percurso: Percurso}) {
        if (event.type === 'focus') {
            if (this.trajetoLayersPanel) {
                this.trajetoLayersPanel.focusFeature(f => f.getGeoJson().properties['id'] === event.percurso.id);
            }
        } else {
            this.router.navigate(['/trajetos/linha', event.percurso.id]);
        }
    }

    onClickBtnPreverEmbarque(event) {
        this.detailButtonState.toggle();
        this.embarqueButtonState.toggle();

        this._embarqueState$.subscribe(embarqueState => {
            this._embarqueLayersSubscription = embarqueState.embarqueCollection.featureLayersObservable()
                .subscribe(featureLayers => this.onEmbarqueStateUpdate(featureLayers));

            this.currentEmbarqueState = embarqueState;
            this.embarqueState$.next(embarqueState);
            this.startEmbarqueUpdateInterval(embarqueState);
        });
    }

    onClickBtnEmbarqueVoltar() {
        this.detailButtonState.toggle();
        this.embarqueButtonState.toggle();

        if (this.embarqueStateUpdateInterval != null) {
            this.embarqueStateUpdateInterval.unsubscribe();
        }

        if (this._embarqueLayersSubscription != null) {
            this._embarqueLayersSubscription.unsubscribe();
        }

        this.removeEmbarqueFeatureLayers();

        if (this.trajetoLayersPanel && !this.trajetoLayersPanel.layersAdded) {
            this.trajetoLayersPanel.addToFeatureState(this.featureState);
        }
    }

    onClickBtnAlerta() {
        if (this.currentEmbarqueState) {
            this.alertaService.setEmbarquesAdefinir(this.currentEmbarqueState);

            this.router.navigate(['/trajetos/alerta']);
        }
    }

    private instanceEmbarqueState(trechoLayers: TrechoLayer[]): EmbarqueState {
        const trechos: TrechoPercurso[] = trechoLayers
            .filter(trecho => trecho.featureEntity.getEntity().position.getDescription() === 'start')
            .map(trecho => trecho.featureEntity.getEntity().percursos)[0];

        const percursos = trechos.map(trecho => {
            return { percurso: trecho.percurso, embarque: trecho.embarques[0] };
        });

        return this.embarqueStateService.instanceState(percursos, 10000);
    }

    private onEmbarqueStateUpdate(layers: EmbarqueLayerCollection) {
        if (!this.embarqueButtonState.enabled) {
            return;
        }

        this.removeTrajetoFeatureLayers();

        this.removeEmbarqueFeatureLayers();

        let embarques = layers.embarques;

        if (embarques.filter(emb => emb.selected).length > 0) {
            embarques = embarques.filter(emb => emb.selected);
        }

        if (embarques.length == 1 && embarques[0].selected) {
            embarques[0].layer.setFocusAffterAdd(true);
        }

        this.embarqueFeatureLayers = [
            ...(layers.paradasLayer != null ? [layers.paradasLayer] : []),
            ...embarques.map(emb => emb.layer)
        ].map(fl => this.featureState.pushFeatureLayer(fl));
    }

    private removeEmbarqueFeatureLayers() {
        this.embarqueFeatureLayers.forEach(fl => fl.removeLayer());
        this.embarqueFeatureLayers = [];
    }

    private removeTrajetoFeatureLayers() {
        if (this.trajetoLayersPanel) {
            if (this.trajetoLayersPanel.layersAdded) {
                this.trajetoLayersPanel.removeAllClientLayers();
            }
        }
    }

    ionViewWillEnter() {
        if (this.currentEmbarqueState != null && this.embarqueLoadStopped) {
            this.embarqueLoadStopped = false;
            this.startEmbarqueUpdateInterval(this.currentEmbarqueState);
        }
    }

    ionViewWillLeave() {
        if (this.isEmbarqueUpdateIntervalRunning()) {
            this.stopEmbarqueUpdateInterval();
            this.embarqueLoadStopped = true;
        }

        if (this.trajetoLayersPanel) {
            this.trajetoLayersPanel.unsubscribeCurrentChange();
        }

        if (this.loadSubscription) {
            this.loadSubscription.unsubscribe();
        }
    }

    private startEmbarqueUpdateInterval(embarqueState: EmbarqueState) {
        if (this.embarqueStateUpdateInterval == null) {
            this.embarqueStateUpdateInterval = embarqueState.requestIntervalUpdate();
        }
    }

    private isEmbarqueUpdateIntervalRunning() {
        return this.embarqueStateUpdateInterval != null;
    }

    private stopEmbarqueUpdateInterval() {
        this.embarqueStateUpdateInterval.unsubscribe();
        this.embarqueStateUpdateInterval = null;
    }

}

class TrajetoLayersPanel {

    private clientFeatureLayers: ClientFeatureLayer[] = [];
    public trechoLayers: TrechoLayer[];
    public layersAdded: boolean = false;
    private changeSubscription: Subscription;

    constructor(
        private origem: FeatureEntity<RouteLocation>,
        private destino: FeatureEntity<RouteLocation>,
        private areasIntegracao: FeatureEntity<FeatureCollection<Geometry>>,
        public trechos: FeatureEntity<TrechoPercursoCollection>[]) {

        this.trechoLayers = trechos.map(trecho => new TrechoLayer(trecho));
    };

    addToFeatureState(featureState: FeatureStateClient) {
        this.layersAdded = true;
        this.unsubscribeCurrentChange();

        this.changeSubscription = concat(
            this.origem.toFeatureLayer().pipe(tap(fl => fl.setFocusAffterAdd(true))),
            this.destino.toFeatureLayer(),
            this.areasIntegracao == null ? EMPTY : this.areasIntegracao.toFeatureLayer()
        ).subscribe(featureLayer => {
            this.clientFeatureLayers.push(featureState.pushFeatureLayer(featureLayer));
        });

        this.trechoLayers.forEach(trechoLayer => trechoLayer.addTrechoSelecionado(featureState));
    }

    removeAllClientLayers() {
        this.layersAdded = false;
        this.clientFeatureLayers.forEach(fl => fl.removeLayer());
        this.clientFeatureLayers = [];
        this.trechoLayers.forEach(trechoLayer => trechoLayer.removeLayer());
    }

    focusFeature(condition: (feature: Feature) => boolean) {
        const featureLayersPercurso = this.trechoLayers
            .filter(trecho => trecho.clientLayer !== undefined)
            .map(trecho => trecho.clientLayer);

        const feature = [...this.clientFeatureLayers, ...featureLayersPercurso]
            .map(fl => fl.featureLayer.getFeatures().map(feature => {
                return {
                    layer: fl,
                    feature: feature
                };
            })).reduce((prev, next) => prev.concat(next), [])
            .filter(feature => condition(feature.feature))[0];

        if (feature) {
            feature.layer.focusFeature(feature.feature);
        }
    }

    unsubscribeCurrentChange() {
        if (this.changeSubscription) {
            this.changeSubscription.unsubscribe();
        }

        this.trechoLayers.forEach(trecho => trecho.unsubscribeCurrentChange());
    }

}

class TrechoLayer {

    public clientLayer: ClientFeatureLayer;
    private changeSubscription: Subscription;
    private featureState: FeatureStateClient;

    constructor(public featureEntity: FeatureEntity<TrechoPercursoCollection>) {
        this.featureEntity.getEntity().addPercursoSelecionadoListener(t => this.onTrechoChanged());
    }

    public addTrechoSelecionado(featureState: FeatureStateClient): Subscription {
        if (featureState) {
            this.featureState = featureState;
            this.changeSubscription = this.featureEntity.toFeatureLayer()
                .subscribe(fl => {
                    this.clientLayer = featureState.pushFeatureLayer(fl);
                });

            return this.changeSubscription;
        }
    }

    public removeLayer() {
        if (this.clientLayer) {
            this.clientLayer.removeLayer();
            this.clientLayer = undefined;
        }
    }

    private onTrechoChanged() {
        this.unsubscribeCurrentChange();
        this.removeLayer();
        this.addTrechoSelecionado(this.featureState);
    }

    public unsubscribeCurrentChange() {
        if (this.changeSubscription) {
            this.changeSubscription.unsubscribe();
            this.changeSubscription = undefined;
        }
    }
}

interface PanelControl {
    enabled: boolean;
    toggle(): void;
}

class PanelControlImpl implements PanelControl {
    constructor(public enabled: boolean, private onDisabled: (pc: PanelControl) => void) {}

    toggle() {
        this.enabled = !this.enabled;

        if (!this.enabled) {
            this.onDisabled(this);
        }
    }
}
