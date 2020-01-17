import { Injectable } from '@angular/core';
import { FeatureStateClient, FeatureState } from 'src/app/shared/components/map/feature-state';
import { Percurso } from 'src/app/shared/models/percurso';
import { Observable, Subscription, Subject, forkJoin } from 'rxjs';
import { VeiculoProvider, VeiculoService } from 'src/app/shared/services/veiculo.service';
import { VeiculoOperacao } from 'src/app/shared/models/veiculo-operacao';
import { FeatureLayer } from 'src/app/shared/models/feature-layer';
import { Feature } from 'src/app/shared/models/feature';
import { ClientFeatureLayer } from 'src/app/shared/components/map/client-feature-layer';
import { ShapeColor, BusFeatureShape } from 'src/app/shared/models/bus-feature-shape';
import { IntervalUpdatedEntity } from 'src/app/shared/util/interval-updated-entity';
import { FeatureProvider } from 'src/app/shared/models/feature-provider';
import { PercursoService } from 'src/app/shared/services/percurso.service';
import { PercursoSet } from './veiculos-store.service';

@Injectable()
export class VeiculosStateService {

    constructor(private veiculoService: VeiculoService, private percursoService: PercursoService) {}

    instanceState(): VeiculosState {
        return new VeiculosStateImpl(this.veiculoService, this.percursoService.toFeatureProvider());
    }

}

export interface VeiculosState {

    featureState: FeatureStateClient;
    percursoList: PercursoList;

    startUpdate(): void;
    stopUpdate(): void;
    selecionarPercurso(percurso: OperacaoPercurso, singleSelection?: boolean): void;

}

class VeiculosStateImpl implements VeiculosState {

    featureState: FeatureStateClient = new FeatureState();
    percursoList: PercursoList = new PercursoListImpl(this.veiculoProvider, this.percursoProvider);
    private layersMap: Map<number, ClientFeatureLayer[]> = new Map();

    constructor(private veiculoProvider: VeiculoProvider, private percursoProvider: FeatureProvider<Percurso>) {
        this.percursoList.eventObservable.subscribe(
            event => event.type == 'remove'
                ? this.onPercursoRemoved(event.percurso)
                : this.onPercursoUpdate(event.percurso)
        );
    }

    private onPercursoUpdate(percurso: OperacaoPercurso) {
        const featureLayers = this.layersMap.has(percurso.percurso.id)
            ? this.layersMap.get(percurso.percurso.id) : [];

        featureLayers.forEach(fl => fl.removeLayer());


        const isSelecionado = this.percursoList.isSelected(percurso);

        let layers: FeatureLayer[] = [];
        if (!this.percursoList.isAnySelected() || isSelecionado) {
            layers = percurso.toFeatureLayer(isSelecionado);
        }

        this.layersMap.set(
            percurso.percurso.id,
            layers.map(fl => this.featureState.pushFeatureLayer(fl))
        );
    }

    private onPercursoRemoved(percurso: OperacaoPercurso) {
        const layers = this.layersMap.get(percurso.percurso.id);

        if (layers) {
            this.layersMap.delete(percurso.percurso.id);
            layers.forEach(layer => layer.removeLayer());
        }
    }

    startUpdate() {
        this.percursoList.startUpdate();
    }

    stopUpdate() {
        this.percursoList.stopUpdate();
    }

    selecionarPercurso(percurso: OperacaoPercurso, singleSelection?: boolean): void {
        if (percurso == null) {
            singleSelection = true;
        }

        if (singleSelection) {
            this.percursoList.clearSelectedSet();
        }

        if (percurso != null) {
            this.percursoList.toggleSelection(percurso);
        }

        if (this.percursoList.isRunning()) {
            this.percursoList.restartUpdate();
        }
    }

}


export interface OperacaoPercurso {

    percurso: Percurso;
    veiculos: VeiculoPercurso[];

    update(listener: (op: OperacaoPercurso) => void): Subscription;
    closeCurrentUpdate(): void;
    toFeatureLayer(includeCompletePath?: boolean): FeatureLayer[];
}

export interface VeiculoPercurso {
    veiculo: VeiculoOperacao,
    percurso: Percurso,
    color: ShapeColor
}

class OperacaoPercursoImpl implements OperacaoPercurso {

    veiculos: VeiculoPercurso[] = [];
    private _currentUpdateSub: Subscription = null;
    private percursoFeature: Feature;

    veiculosPercurso: VeiculoPercurso[] = [];

    constructor(
        public percurso: Percurso,
        private provider: VeiculoProvider,
        private percursoProvider: FeatureProvider<Percurso>) {
    }

    private setVeiculos(veiculos: VeiculoOperacao[]) {
        const colorList: ShapeColor[] = ["green", "orange", "red", "purple", "cadetblue", "blue", "darkred", "darkgreen", "darkpurple"];

        this.veiculos = veiculos.sort((v1, v2) => {
            const v1Distance = v1.trechoRestante == null ? 111222333 : v1.trechoRestante.properties.distance;
            const v21Distance = v2.trechoRestante == null ? 111222333 : v2.trechoRestante.properties.distance;

            return v1Distance > v21Distance ? -1 : v1Distance < v21Distance ? 1 : 0;
        }).map((v, i) => {
            return {
                veiculo: v,
                percurso: this.percurso,
                color: colorList[i % colorList.length]
            } as VeiculoPercurso;
        });
    }

    closeCurrentUpdate() {
        if (this._currentUpdateSub != null) {
            this._currentUpdateSub.unsubscribe();
        }
    }

    update(listener: (op: OperacaoPercurso) => void): Subscription {
        this._currentUpdateSub = forkJoin(
            this.percursoProvider.getFeature(this.percurso),
            this.provider.obterVeiculos(this.percurso)
        ).subscribe(result => {
            this.percursoFeature = result[0];
            this.setVeiculos(result[1]);
            listener(this);
        });

        return this._currentUpdateSub;
    }

    toFeatureLayer(includeCompletePath?: boolean): FeatureLayer[] {
        let layers: FeatureLayer[] = this.veiculos.map((v, i) => {
            return FeatureLayer.fromFeatures([
                Feature.fromGeoPoint(v.veiculo.instante.instante.localizacao),
                ...(v.veiculo.trechoRestante ? [Feature.fromGeojson(v.veiculo.trechoRestante)] : [])
            ], {
                shape: new BusFeatureShape(v.color)
            });
        });

        if (this.percursoFeature != null && includeCompletePath) {
            layers = [ FeatureLayer.fromFeature(this.percursoFeature), ...layers ];
        }

        return layers;
    }
}



interface PercursoEvent {
    type: 'update' | 'remove' | 'add';
    percurso: OperacaoPercurso;
}

export interface PercursoList extends IntervalUpdatedEntity {

    percursos: OperacaoPercurso[];
    eventObservable: Observable<PercursoEvent>;
    set: PercursoSet;

    add(percurso: Percurso): OperacaoPercurso;
    remove(operacaoPercurso: OperacaoPercurso): void;
    has(percurso: Percurso): boolean;
    isEmpty(): boolean;
    toggleSelection(percurso: OperacaoPercurso): void;
    isSelected(percurso: OperacaoPercurso): boolean;
    isAnySelected(): boolean;
    clearSelectedSet(): void;
    setupListFromSet(set: PercursoSet): void;
    isSetSetup(): boolean;
    disconnectFromSet(): void;

}

class PercursoListImpl extends IntervalUpdatedEntity implements PercursoList {

    percursos: OperacaoPercurso[] = [];
    set: PercursoSet = null;
    private _selectedSet: Set<number> = new Set();
    private eventSubject: Subject<PercursoEvent> = new Subject();

    constructor(private provider: VeiculoProvider, private percursoProvider: FeatureProvider<Percurso>) {
        super(5000);
    }

    get eventObservable(): Observable<PercursoEvent> {
        return this.eventSubject;
    }

    setupListFromSet(set: PercursoSet) {
        this.clearSelectedSet();

        this.percursos.slice().forEach(perc => this.remove(perc));
        set.percursos.forEach(perc => this.add(perc));

        this.set = set;
    }

    add(percurso: Percurso): OperacaoPercurso {
        const operacaoPercurso = new OperacaoPercursoImpl(percurso, this.provider, this.percursoProvider);
        this.percursos.push(operacaoPercurso);

        this.updateSet();

        this.eventSubject.next({
            type: 'add',
            percurso: operacaoPercurso
        });
        if (this.isRunning()) {
            this.restartUpdate();
        }

        return operacaoPercurso;
    }

    remove(perc: OperacaoPercurso): void {
        const index = this.percursos.indexOf(perc);

        if (index != -1) {
            this.percursos[index].closeCurrentUpdate();
            this.percursos.splice(index, 1);

            this.updateSet();

            if (this.isSelected(perc)) {
                this.toggleSelection(perc);

                if (this.isRunning()) {
                    this.restartUpdate();
                }
            }

            this.eventSubject.next({
                type: 'remove',
                percurso: perc
            });
        }
    }

    has(percurso: Percurso): boolean {
        return this.percursos.filter(perc => perc.percurso.id == percurso.id).length > 0;
    }

    isEmpty(): boolean {
        return this.percursos.length == 0;
    }

    toggleSelection(percurso: OperacaoPercurso) {
        if (this._selectedSet.has(percurso.percurso.id)) {
            this._selectedSet.delete(percurso.percurso.id);
        } else {
            this._selectedSet.add(percurso.percurso.id);
        }
    }

    isSelected(percurso: OperacaoPercurso): boolean {
        return this._selectedSet.has(percurso.percurso.id);
    }

    isAnySelected(): boolean {
        return this._selectedSet.size > 0;
    }

    clearSelectedSet(): void {
        this._selectedSet.clear();
    }

    isSetSetup(): boolean {
        return this.set != undefined && this.set != null;
    }

    disconnectFromSet(): void {
        this.set = null;
    }

    protected update(): Subscription {
        this.percursos.forEach(percurso => percurso.update(perc => {
            this.eventSubject.next({
                type: 'update',
                percurso: perc
            });
        }));

        return new Subscription(() => {
            this.percursos.forEach(percurso => percurso.closeCurrentUpdate());
        });
    }

    private updateSet() {
        if (this.set != null) {
            this.set.updateAndSave(this.percursos.map(p => p.percurso))
                .subscribe();
        }
    }

}
