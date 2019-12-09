import { Injectable } from '@angular/core';
import { VeiculoService, VeiculoProvider } from 'src/app/shared/services/veiculo.service';
import { Percurso } from 'src/app/shared/models/percurso';
import { Observable, concat, of, interval, Subject, ReplaySubject, Subscription } from 'rxjs';
import { InstanteVeiculo } from 'src/app/shared/models/instante-veiculo';
import { FeatureLayer } from 'src/app/shared/models/feature-layer';
import { tap, publishReplay, refCount, flatMap, map } from 'rxjs/operators';
import { VeiculoOperacao } from 'src/app/shared/models/veiculo-operacao';
import { Feature } from 'src/app/shared/models/feature';
import { ShapeColor, BusFeatureShape } from 'src/app/shared/models/bus-feature-shape';

@Injectable()
export class VeiculoStateService {

    constructor(private veiculoService: VeiculoService) {}

    instanceState(percurso: Percurso): VeiculoState {
        return new VeiculoStateImpl(percurso, this.veiculoService);
    }

}

export interface VeiculoState {

    subscribeForList(sub: (list: VeiculosList) => void): Subscription;
    subscribeForLayers(sub: (layers: FeatureLayer[]) => void): Subscription;
    setPercurso(percurso: Percurso): void;

}

class VeiculoStateImpl implements VeiculoState {

    private veiculosList: VeiculosList = new VeiculosListImpl((v, s) => this.onVeiculoSelecionado(v, s));
    private veiculosSubject: Subject<VeiculoOperacao[]> = new ReplaySubject(1);
    private subscriptions: Set<Subscription> = new Set();
    private interval$: Observable<number>;
    private intervalSubscription: Subscription = null;

    constructor(private percurso: Percurso, private veiculoProvider: VeiculoProvider) {
        this.interval$ = concat(of(1), interval(5000));
    }

    subscribeForList(sub: (list: VeiculosList) => void): Subscription {
        return this.receiveSubscription(this.veiculosSubject
            .pipe(map(() => this.veiculosList))
            .subscribe(sub));
    }

    subscribeForLayers(sub: (layers: FeatureLayer[]) => void): Subscription {
        return this.receiveSubscription(this.veiculosSubject
            .pipe(map(veiculos => this.toFeatureLayer(veiculos)))
            .subscribe(sub));
    }

    setPercurso(percurso: Percurso) {
        this.percurso = percurso;
        this.updateSubject();
    }

    private onVeiculoSelecionado(veiculo: InstanteVeiculo, selected: boolean) {
        this.updateSubject();
    }

    private updateSubject() {
        this.veiculoProvider.obterVeiculos(this.percurso)
            .subscribe(veiculos => this.addToSubject(veiculos));
    }

    private addToSubject(veiculos: VeiculoOperacao[]) {
        this.addToList(veiculos);
        this.veiculosSubject.next(veiculos);
    }

    private receiveSubscription(subs: Subscription): Subscription {
        if (this.subscriptions.size === 0) {
            this.startInterval();
        }

        this.subscriptions.add(subs);

        subs.add(() => {
            this.subscriptions.delete(subs);
            if (this.subscriptions.size === 0) {
                this.stopInterval();
            }
        });
        return subs;
    }

    private startInterval() {
        this.intervalSubscription = this.interval$.subscribe(() => {
            this.updateSubject();
        });
    }

    private stopInterval() {
        if (this.intervalSubscription != null) {
            this.intervalSubscription.unsubscribe();
        }
    }

    private toFeatureLayer(veiculos: VeiculoOperacao[]): FeatureLayer[] {
        veiculos = veiculos.filter(v => !this.veiculosList.isAnySelecionado() || this.veiculosList.isSelecionado(v.instante));

        veiculos.sort((v1, v2) => {
            const v1Distance = v1.trechoRestante == null ? 111222333 : v1.trechoRestante.properties.distance;
            const v21Distance = v2.trechoRestante == null ? 111222333 : v2.trechoRestante.properties.distance;

            return v1Distance > v21Distance ? -1 :
                v1Distance < v21Distance ? 1 : 0;
        });

        return veiculos.map(v => {
            return FeatureLayer.fromFeatures([
                Feature.fromGeoPoint(v.instante.instante.localizacao),
                ...(v.trechoRestante ? [Feature.fromGeojson(v.trechoRestante)] : [])
            ], {
                shape: new BusFeatureShape(this.veiculosList.findColor(v.instante)),
                focusAffterAdd: this.veiculosList.isUnicoSelecionado(v.instante)
            });
        });
    }

    private addToList(veiculos: VeiculoOperacao[]) {
        this.veiculosList.veiculos = veiculos.map(v => v.instante);
    }
}

export interface VeiculosList {

    veiculos: InstanteVeiculo[];
    isAnySelecionado(): boolean;
    isSelecionado(veiculos: InstanteVeiculo): boolean;
    isUnicoSelecionado(veiculo: InstanteVeiculo): boolean;
    selecionar(veiculos: InstanteVeiculo): void;
    findColor(veiculo: InstanteVeiculo): ShapeColor;

}

export class VeiculosListImpl implements VeiculosList {

    private colorList: ShapeColor[] = ["green", "orange", "red", "purple", "cadetblue", "blue", "darkred", "darkgreen", "darkpurple"];
    private colorIndex = 0;
    private colorMap: Map<string, ShapeColor> = new Map();

    veiculos: InstanteVeiculo[] = [];
    private selecionados: Set<string> = new Set();

    constructor(private selectListener: (veiculo: InstanteVeiculo, selected: boolean) => void) {}

    isAnySelecionado(): boolean {
        return this.selecionados.size > 0;
    }

    isSelecionado(veiculo: InstanteVeiculo): boolean {
        return this.selecionados.has(veiculo.veiculo.numero);
    }

    isUnicoSelecionado(veiculo: InstanteVeiculo): boolean {
        return this.isSelecionado(veiculo) && this.selecionados.size === 1;
    }

    selecionar(veiculo: InstanteVeiculo): void {
        if (this.isSelecionado(veiculo)) {
            this.selectListener(veiculo, false);
            this.selecionados.delete(veiculo.veiculo.numero);
        } else {
            this.selectListener(veiculo, true);
            this.selecionados.add(veiculo.veiculo.numero);
        }
    }

    findColor(veiculo: InstanteVeiculo): ShapeColor {
        if (!this.colorMap.has(veiculo.veiculo.numero)) {
            this.colorMap.set(veiculo.veiculo.numero, this.nextColor());
        }

        return this.colorMap.get(veiculo.veiculo.numero);
    }

    private nextColor(): ShapeColor {
        if (this.colorIndex === this.colorList.length - 1) {
            this.colorIndex = 0;
        }

        return this.colorList[this.colorIndex++];
    }

}
