import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Alarme, Metrica } from '../../alarme-embarque.service';
import { FeatureStateClient, FeatureState } from 'src/app/shared/components/map/feature-state';
import { MapConfig } from 'src/app/shared/components/map/map-config';
import { ClientFeatureLayer } from 'src/app/shared/components/map/client-feature-layer';
import { EmbarqueLayerCollection, Embarque, ColorfulEmbarque } from '../../embarque-state.service';
import { Subscription, Observable } from 'rxjs';
import { EmbarqueList } from '../embarque-list/embarque-list.component';
import { map } from 'rxjs/operators';

@Component({
    selector: 'alarme',
    templateUrl: './alarme.component.html',
    styleUrls: ['./alarme.component.scss']
})
export class AlarmeComponent implements OnInit, OnDestroy {

    @Input()
    public alarme: Alarme;
    public mapConfig: MapConfig = { layersControlPosition: 'disabled' };
    public featureState: FeatureStateClient = new FeatureState();
    private _layersSubscrition: Subscription = null;
    public rangeControl: RangeControl = null;
    private _firstLayerAdded: boolean = false;

    embarquesEminentes$: Observable<EmbarqueList>;

    private currentMapLayers: ClientFeatureLayer[] = [];

    ngOnInit() {
        this.rangeControl = new RangeControl(this.alarme.metrica);

        this._layersSubscrition = this.alarme.embarqueState.embarqueCollection
            .featureLayersObservable().subscribe(fl => this.onEmbarquesUpdate(fl));

        this.embarquesEminentes$ = this.alarme.alarmSubject
            .pipe(map(embarques => new EmbarqueListImpl(embarques)));
    }

    private onEmbarquesUpdate(layerCollection: EmbarqueLayerCollection) {
        this.currentMapLayers.forEach(cfl => cfl.removeLayer());

        this.rangeControl.update(layerCollection.embarques.map(emb => emb.embarque.embarque));

        if (!this._firstLayerAdded && layerCollection.paradasLayer != null) {
            layerCollection.paradasLayer.setFocusAffterAdd(true);
        }

        this._firstLayerAdded = true;

        this.currentMapLayers = [
            ...(layerCollection.paradasLayer != null ? [layerCollection.paradasLayer] : []),
            ...layerCollection.embarques.map(emb => emb.layer)
        ].map(fl => this.featureState.pushFeatureLayer(fl));
    }

    ngOnDestroy() {
        if (this._layersSubscrition != null) {
            this._layersSubscrition.unsubscribe();
        }
    }

}

class RangeControl {

    min: number;
    max: number;
    private _value: number = null;

    constructor(public metrica: Metrica) {
        this.min = metrica.value;
        this.max = this.min - 1 + 30;
    }

    get value(): number {
        return this._value == null ? this.max : this._value;
    }

    set value(val: number) {
        if (val > this.max) {
            val = this.max;
        } else if (val < this.min) {
            val = this.min;
        }

        this._value = val;
    }

    get desc(): string {
        return this.metrica.desc;
    }

    update(embarques: Embarque[]) {
        const embarque = this.metrica.min(embarques);

        let value = this.max;
        if (embarque != null) {
            value = this.metrica.valueFrom(embarque);
        }

        this.value = value;
    }

}


class EmbarqueListImpl implements EmbarqueList {

    constructor(public embarques: ColorfulEmbarque[]) {}

    isSelecionado(embarque: ColorfulEmbarque): boolean { return false; }

    selecionarEmbarque(embarque: ColorfulEmbarque): void {}

}
