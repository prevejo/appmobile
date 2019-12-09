import { Injectable } from '@angular/core';
import { RoutePanelState, RoutePanelStateService } from './route-panel-state.service';
import { RouteLocation, ParadaRouteLocation, CurrentRouteLocation } from 'src/app/shared/models/route-location';
import { FeatureState, FeatureStateClient } from 'src/app/shared/components/map/feature-state';
import { FeatureLayer } from 'src/app/shared/models/feature-layer';
import { ClientFeatureLayer } from 'src/app/shared/components/map/client-feature-layer';
import { ParadaService } from 'src/app/shared/services/parada.service';
import { Observable, Subscription } from 'rxjs';
import { FeatureCollection } from 'geojson';
import { map } from 'rxjs/operators';
import { Feature } from 'src/app/shared/models/feature';
import { RouteLocationEntry } from 'src/app/shared/models/route-location-entry';
import { ParadaFeatureShape } from 'src/app/shared/models/parada-feature-shape';
import { CacheableObservable } from 'src/app/shared/util/cacheable-observable';

@Injectable()
export class PesquisaStateService {

    constructor(private routePanelStateService: RoutePanelStateService, private paradaService: ParadaService) {}

    instanceState(): PesquisaState {
        return new PesquisaStateImpl(this.routePanelStateService.instanceState(), this.paradaService.obterFeatureCollection());
    }

}


export interface PesquisaState {
    featureState: FeatureStateClient;
    routePanelState: RoutePanelState;
    pushFeatureLayer(fl: FeatureLayer): ClientFeatureLayer;
    showParadas(): Subscription;
    hideParadas(): void;
    isPesquisaReady(): boolean;
}


class PesquisaStateImpl implements PesquisaState {

    public featureState: FeatureStateClient = new FeatureState();
    private layersMap: Map<RouteLocationEntry, ClientFeatureLayer> = new Map();
    private paradaMap: Map<string, Feature> = new Map();
    private paradas: Observable<FeatureLayer>;
    private paradasLayer: ClientFeatureLayer;

    constructor(public routePanelState: RoutePanelState, paradas: Observable<FeatureCollection>) {
        routePanelState.subscribeForAdd(rl => this.onRouteLocationAdded(rl));
        routePanelState.subscribeForRemove(rl => this.onRouteLocationRemoved(rl));
        this.setParadas(paradas);
    }

    isPesquisaReady(): boolean {
        return this.routePanelState.isStartLocationDefined() && this.routePanelState.isEndLocationdefined();
    }

    showParadas(): Subscription {
        return this.paradas.subscribe(featureLayer => {
            this.paradasLayer = this.pushFeatureLayer(featureLayer);

            this.paradasLayer.subscribeForSelect(feature => this.onParadaSelected(feature));
        });
    }

    hideParadas() {
        this.paradasLayer.removeLayer();
        this.paradasLayer = undefined;
    }

    pushFeatureLayer(featureLayer: FeatureLayer): ClientFeatureLayer {
        return this.featureState.pushFeatureLayer(featureLayer);
    }

    private onParadaSelected(feature: Feature) {
        this.paradasLayer.removeFeature(feature);
        this.routePanelState.setRouteLocation(new ParadaRouteLocation({
            geo: feature.getGeoJson().geometry as GeoJSON.Point,
            cod: feature.getGeoJson().properties['codigo']
        }));
        this.paradaMap.set(feature.getGeoJson().properties['codigo'], feature);
    }

    private setParadas(paradas: Observable<FeatureCollection>) {
        this.paradas = new CacheableObservable(paradas.pipe(map(fc => FeatureLayer.fromCollection(fc, {
            cluster: true,
            shape: new ParadaFeatureShape(),
            controlName: 'paradas'
        }))));
    }

    private onRouteLocationAdded(rl: RouteLocationEntry) {
        if (!(rl.getRouteLocation() instanceof CurrentRouteLocation)) {
            this.layersMap.set(rl, this.featureState.pushFeatureLayer(rl.toFeatureLayer()));
        }
    }

    private onRouteLocationRemoved(rl: RouteLocationEntry) {
        const featureLayer: ClientFeatureLayer = this.layersMap.get(rl);

        if (featureLayer) {
            featureLayer.removeLayer();
            this.layersMap.delete(rl);
        }

        const routeLoc: RouteLocation = rl.getRouteLocation();

        if (routeLoc instanceof ParadaRouteLocation && this.paradaMap.has(routeLoc.getParada().cod)) {
            this.paradasLayer.addFeature(this.paradaMap.get(routeLoc.getParada().cod));
            this.paradaMap.delete(routeLoc.getParada().cod);
        }
    }

}