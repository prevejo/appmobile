import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeatureStateClient, FeatureState } from 'src/app/shared/components/map/feature-state';
import { MapConfig } from 'src/app/shared/components/map/map-config';
import { LinhaState, LinhaStateService } from '../../linha-state-service';
import { ClientFeatureLayer } from 'src/app/shared/components/map/client-feature-layer';
import { FeatureLayer } from 'src/app/shared/models/feature-layer';
import { Observable, of, throwError, forkJoin, Subscription, Subject } from 'rxjs';
import { flatMap, map, first, shareReplay, tap } from 'rxjs/operators';
import { LinhaPanelOption } from '../../components/sentido-panel/sentido-panel.component';
import { VeiculoStateService, VeiculoState, VeiculosList } from '../../veiculo-state.service';
import { Percurso } from 'src/app/shared/models/percurso';

@Component({
    templateUrl: './detalhamento-linha.page.html',
    styleUrls: ['./detalhamento-linha.page.scss']
})
export class DetalhamentoLinhaPage implements OnInit {

    public state$: Observable<LinhaState>;
    private state: LinhaState = null;
    private veiculosState: VeiculoState = null;
    public veiculos$: Subject<VeiculosList> = new Subject();
    private veiculosLayers: ClientFeatureLayer[] = [];
    private veiculosSubscription: SubscriptionHolder = new SubscriptionHolder();
    private veiculosLayerSubscription: SubscriptionHolder = new SubscriptionHolder();
    private percursoId$: Observable<number>;

    public sentido: string;

    public featureState: FeatureStateClient = new FeatureState();
    public linhaButtonState: PanelState = { enabled: true, toggle: function() { this.enabled = !this.enabled; } };
    public horariosButtonState: PanelState = { enabled: false, toggle: function() { this.enabled = !this.enabled; } };
    public veiculosButtonState: PanelState = { enabled: false, toggle: function() { this.enabled = !this.enabled; } };
    private lastRetailPanel: PanelState = null;
    public mapConfig: MapConfig = {
        layersControlPosition: 'topleft',
        buttons: [{
            title: 'Exibir detalhes',
            icon: 'fa-ellipsis-v',
            position: 'bottomleft',
            clickFunction: (btn, map) => this.lastRetailPanel != null ? this.lastRetailPanel.toggle() : null,
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

    private percursoLayer: MapLayer = new MapLayer(this.featureState);
    private paradasLayer: MapLayer = new MapLayer(this.featureState);

    private veiculosOption: VeiculoOption = new VeiculoOption('Veiculos', false, selected => this.onVeiculosLayerSelect(selected));
    private embarquesOption: LinhaOption = new LinhaOption('Embarques', true, this.paradasLayer);
    public linhaOptions: LinhaPanelOption[] = [ this.embarquesOption, this.veiculosOption ];

    constructor(
        private route: ActivatedRoute,
        private linhaStateService: LinhaStateService,
        private veiculoStateService: VeiculoStateService) {}

    ngOnInit() {
        this.percursoId$ = this.route.paramMap
            .pipe(first())
            .pipe(flatMap(map => map.has('percursoId')
                ? of(parseInt(map.get('percursoId')))
                : throwError('Percurso não identificado')));

        this.state$ = this.percursoId$
            .pipe(map(percursoId => this.linhaStateService.instanceState(percursoId)))
            .pipe(tap((state) => this.state = state))
            .pipe(shareReplay({refCount: true, bufferSize: 1}));


        forkJoin([
            this.percursoId$,
            this.state$
        ]).subscribe(args => {
            const percursoId = args[0];
            const state: LinhaState = args[1];

            state.subscribeForPercursoLayerChange(layer => this.percursoLayer.layerChange(layer));
            state.subscribeForParadasLayerChange(layer => {
                this.paradasLayer.layerChange(layer);
                if (!this.embarquesOption.isSelected()) {
                    this.paradasLayer.enabled(false);
                }
            });
            state.subscribeForPercursoChange(percurso => this.onPercursoSelecionado(percurso));
            state.selecionarByPercursoId(percursoId);
        });
    }

    onSentidoChange(sentido: string) {
        this.state$.subscribe(state => {
            state.setPercurso(sentido);
        });
    }

    onVeiculosLayerSelect(selected: boolean) {
        if (selected) {
            this.embarquesOption.unselect();
            this.veiculosLayerSubscription.subscribe();
        } else {
            this.veiculosLayerSubscription.unsubscribe();
            this.clearVeiculosLayers();
            this.embarquesOption.select();
        }
    }

    onClickBtnVeiculos() {
        this.openPanel(this.veiculosButtonState);
        this.veiculosSubscription.subscribe();
        this.veiculosOption.select();
    }

    onClickBtnVoltarVeiculos() {
        this.veiculosSubscription.unsubscribe();
    }

    ionViewWillEnter() {
        this.veiculosLayerSubscription.returnIfSuspended();
        this.veiculosSubscription.returnIfSuspended();
    }

    ionViewWillLeave() {
        if (this.state) {
            this.state.unsubscribeCurrentLoad();
        }
        this.veiculosLayerSubscription.suspend();
        this.veiculosSubscription.suspend();
    }

    openPanel(panel: PanelState) {
        [this.linhaButtonState, this.horariosButtonState, this.veiculosButtonState]
            .filter(btn => btn.enabled)
            .forEach(btn => btn.toggle());

        panel.toggle();
    }

    retailPanel(panel: PanelState) {
        this.lastRetailPanel = panel;
        panel.toggle();
    }

    private onPercursoSelecionado(percurso: Percurso) {
        this.sentido = percurso.sentido;

        if (this.veiculosState == null) {
            this.veiculosState = this.veiculoStateService.instanceState(percurso);
            this.veiculosSubscription.setProvider(() => this.veiculosState.subscribeForList(veiculos => {
                this.veiculos$.next(veiculos);
            }));

            this.veiculosLayerSubscription.setProvider(() => this.veiculosState.subscribeForLayers(layers => {
                this.clearVeiculosLayers();
                this.veiculosLayers = layers.map(layer => this.featureState.pushFeatureLayer(layer));
            }));
        }

        this.veiculosState.setPercurso(percurso);
    }

    private clearVeiculosLayers() {
        this.veiculosLayers.forEach(layer => layer.removeLayer());
        this.veiculosLayers = [];
    }

}

interface PanelState {
    enabled: boolean;
    toggle(): void;
}

class MapLayer {
    current: ClientFeatureLayer;
    private last: FeatureLayer;

    constructor(private state: FeatureStateClient) {}

    layerChange(fl: FeatureLayer) {
        this.last = fl;
        this.setLastAsCurrent();
    }

    enabled(enable: boolean) {
        enable ? this.setLastAsCurrent() : this.remove();
    }

    private setLastAsCurrent() {
        if (this.last) {
            this.remove();
            this.current = this.state.pushFeatureLayer(this.last);
        }
    }

    private remove() {
        if (this.current) {
            this.current.removeLayer();
            this.current = undefined;
        }
    }
}

class LinhaOption implements LinhaPanelOption {
    constructor(public name: string, private selected: boolean, private layer: MapLayer) {}

    select(): void {
        if (!this.selected) {
            this.layer.enabled(true);
            this.selected = true;
        }
    }

    unselect(): void {
        if (this.selected) {
            this.layer.enabled(false);
            this.selected = false;
        }
    }

    isSelected(): boolean {
        return this.selected;
    }
}

class VeiculoOption implements LinhaPanelOption {

    constructor(public name: string, private selected: boolean, private onSelectListener: (selected: boolean) => void) {}

    select(): void {
        if (!this.selected) {
            this.selected = true;
            this.onSelectListener(true);
        }
    }

    unselect(): void {
        if (this.selected) {
            this.selected = false;
            this.onSelectListener(false);
        }
    }

    isSelected(): boolean {
        return this.selected;
    }
}


class SubscriptionHolder {

    private sub: Subscription = null;
    private subProvider: () => Subscription;
    private suspended = false;

    constructor() {}

    setProvider(subProvider: () => Subscription) {
        this.subProvider = subProvider;
    }

    suspend() {
        if (this.sub != null) {
            this.suspended = true;
            this.unsubscribe();
        }
    }

    returnIfSuspended() {
        if (this.suspended) {
            this.suspended = false;
            this.subscribe();
        }
    }

    unsubscribe() {
        if (this.sub != null) {
            this.sub.unsubscribe();
            this.sub = null;
        }
    }

    subscribe() {
        if (this.sub != null) {
            this.unsubscribe();
        }

        if (this.subProvider) {
            this.sub = this.subProvider();
        }
    }

}
