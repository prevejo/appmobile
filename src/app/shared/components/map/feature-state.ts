import { Subject, Subscription, ReplaySubject } from 'rxjs';
import { FeatureLayer } from '../../models/feature-layer';
import { ClientFeatureLayer } from './client-feature-layer';
import { Feature } from '../../models/feature';
import { MapFeatureLayer } from './map-feature-layer';

export class FeatureState implements FeatureStateClient, FeatureStateMap {

    private featureLayerAddChannel: Subject<MapFeatureLayer> = new ReplaySubject<MapFeatureLayer>();

    subscribeForAdd(subFunc: (fl: MapFeatureLayer) => void): Subscription {
        return this.featureLayerAddChannel.subscribe(subFunc);
    }

    pushFeatureLayer(fl: FeatureLayer): ClientFeatureLayer {
        const flc: FeatureLayerControl = new FeatureLayerControl(fl);

        this.featureLayerAddChannel.next(flc);

        return flc;
    }

}

export interface FeatureStateClient {
    pushFeatureLayer(fl: FeatureLayer): ClientFeatureLayer;
}

export interface FeatureStateMap {
    subscribeForAdd(subFunc: (fl: MapFeatureLayer) => void);
}


class FeatureLayerControl implements ClientFeatureLayer, MapFeatureLayer {

    private addControl: Subject<Feature> = new ReplaySubject<Feature>();
    private removeControl: Subject<Feature> = new ReplaySubject<Feature>();
    private removeLayerControl: Subject<FeatureLayer> = new ReplaySubject<FeatureLayer>();
    private selectControl: Subject<Feature> = new Subject<Feature>();
    private focusControl: Subject<Feature> = new Subject<Feature>();

    constructor(public featureLayer: FeatureLayer) {}

    addFeature(feature: Feature) {
        this.addControl.next(feature);
    }
    
    removeFeature(feature: Feature) {
        this.removeControl.next(feature);
    }

    focusFeature(feature: Feature) {
        this.focusControl.next(feature);
    }

    removeLayer() {
        this.removeLayerControl.next(this.featureLayer);
    }

    subscribeForAdd(sub: (feature: Feature) => void): Subscription {
        return this.addControl.subscribe(sub);
    }

    subscribeForRemove(sub: (feature: Feature) => void): Subscription {
        return this.removeControl.subscribe(sub);
    }

    subscribeForFocus(sub: (feature: Feature) => void): Subscription {
        return this.focusControl.subscribe(sub);
    }

    subscribeForRemoveLayer(sub: (feature: FeatureLayer) => void): Subscription {
        return this.removeLayerControl.subscribe(sub);
    }

    subscribeForSelect(sub: (feature: Feature) => void): Subscription {
        return this.selectControl.subscribe(sub);
    }

    pushFeatureSelected(feature: Feature) {
        this.selectControl.next(feature);
    }

}