import { Component, AfterViewInit, ViewChild, ElementRef, Inject, Input, EventEmitter, Output } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet-easybutton';
import { AppConfig, APP_CONFIG, MapTileConfig } from 'src/app/core/services/app-config.service';
import { LocateControl } from './locale-control';
import { UserLocationService } from '../../services/user-location.service';
import { FeatureStateMap } from './feature-state';
import { MapFeatureLayer } from './map-feature-layer';
import { Feature } from '../../models/feature';
import { FeatureLayer } from '../../models/feature-layer';
import { FeatureShape } from '../../models/feature-shape';
import { MapConfig } from './map-config';

@Component({
    selector: 'map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit {

    @ViewChild('map', {static: false})
    public mapElement: ElementRef;

    @Output()
    public onMapMoves: EventEmitter<any> = new EventEmitter();
    @Output()
    public onLocationRequest: EventEmitter<any> = new EventEmitter();
    @Input()
    public state: FeatureStateMap;

    @Input()
    public config: MapConfig = {
        requestUserLocation: false,
        layersControlPosition: 'bottomleft',
        buttons: []
    };


    private layersControl: L.Control.Layers;

    private map: L.Map;
    private mapTileDefault: L.TileLayer;
    private mapTiles: MapTileConfig[];
    private locateControl: LocateControl;
    private featureLayers: FeatureLayer[] = [];

    constructor(@Inject(APP_CONFIG) appConfig: AppConfig, private userLocService: UserLocationService) {
        this.mapTiles = appConfig.mapTiles;
    }

    ngAfterViewInit() {
        this.initMap();

        if (this.state) {
            this.state.subscribeForAdd(fl => this.addFeatureLayer(fl));
        }
    }

    private rebuildLayersControl() {
        if (this.config.layersControlPosition == 'disabled') {
            return;
        }

        if (this.layersControl != undefined) {
            this.layersControl.remove();
        }
        this.layersControl = this.buildLayersControl();
        this.layersControl.addTo(this.map);
    }

    private initMap() {
        if (this.mapTileDefault == undefined) {
            this.mapTileDefault = L.tileLayer(this.mapTiles[0].url, this.mapTiles[0].props);
        }

        this.map = L.map(this.mapElement.nativeElement, {
            center: [-15.794797016134899, -47.9262052592602],
            zoom: 12,
            maxZoom: 18,
            layers: [this.mapTileDefault],
            zoomControl: false
        });

        this.map.on('movestart', event => this.onMapMoves.emit(event));

        this.locateControl = new LocateControl(this.LOCATION_OPTIONS).addTo(this.map);
        this.locateControl.onClickListener = () => this.onLocationRequest.emit();
        this.locateControl.onLocationFoundListener = e => this.onLocationFound(e);

        this.rebuildLayersControl();

        this.buildButtonsControl(this.config, this.map);

        this.map['attributionControl'].remove();

        setTimeout(() => {
            this.map.invalidateSize();

            if (this.config.requestUserLocation) {
                this.locateControl.start();
            }
        }, 1000);
    }

    private addFeatureLayer(fl: MapFeatureLayer) {
        const featureShape: FeatureShape = fl.featureLayer.getShape();

        let pointToLayer = undefined, styleFunction = undefined;

        if (featureShape) {
            if (featureShape.pointToLayer()) {
                pointToLayer = (geoJson, latLng) => featureShape.pointToLayer()(geoJson.properties['_feature'], latLng);
            }
            if (featureShape.style()) {
                styleFunction = geoJson => featureShape.style()(geoJson.properties['_feature']);
            }
        }


        const layer: L.GeoJSON = L.geoJSON(undefined, {
            pointToLayer: pointToLayer,
            style: styleFunction
        });

        fl.featureLayer['_layer'] = layer;
        fl.featureLayer.getFeatures().forEach(feature => this.addFeatureToLayer(feature, layer, fl));
        fl.subscribeForAdd(feature => {
            this.addFeatureToLayer(feature, fl.featureLayer['_layer'], fl);
            fl.featureLayer.getFeatures().push(feature);
        });

        fl.subscribeForRemove(feature => {
            this.removeFeatureFromLayer(feature, fl.featureLayer);
            fl.featureLayer.getFeatures().splice(fl.featureLayer.getFeatures().indexOf(feature), 1);
        });
        fl.subscribeForRemoveLayer(fl => this.removeFeatureLayer(fl));
        fl.subscribeForFocus(feature => {
            if (feature['_layer']) {
                const layer = feature['_layer'];

                if (layer['getLatLng']) {
                    this.map.panTo(layer['getLatLng']());
                } else if (layer['getBounds']) {
                    this.map.fitBounds(layer.getBounds());
                }
            }
        });
        

        if (fl.featureLayer.isClusterLayer()) {
            const cluster: L.MarkerClusterGroup = L.markerClusterGroup({
                disableClusteringAtZoom: 15
            });

            cluster.addLayer(layer);

            fl.featureLayer['_cluster'] = cluster;
            cluster.addTo(this.map);
        } else {
            layer.addTo(this.map);

            if (fl.featureLayer.isFocusAffterAdd()) {
                this.map.panTo(fl.featureLayer['_layer'].getBounds().getCenter())
            }
        }

        this.featureLayers.push(fl.featureLayer);
        this.rebuildLayersControl();
    }

    private addFeatureToLayer(feature: Feature, layer: L.GeoJSON, mapFeatureLayer: MapFeatureLayer) {
        const geoJson = feature.getGeoJson();
        layer.addData(geoJson);
        geoJson.properties['_feature'] = feature;
        feature['_layer'] = layer.getLayers().filter(l => l['feature'] == geoJson)[0];

        feature['_layer'].on({
            'click': e => this.onClickFeature(e.target.feature.properties['_feature'], mapFeatureLayer)
        });

        if (mapFeatureLayer.featureLayer.isClusterLayer() && mapFeatureLayer.featureLayer['_cluster']) {
            mapFeatureLayer.featureLayer['_cluster'].clearLayers();
            mapFeatureLayer.featureLayer['_cluster'].addLayer(mapFeatureLayer.featureLayer['_layer']);
        }
    }

    private removeFeatureLayer(featureLayer: FeatureLayer) {
        const layer: string = featureLayer.isClusterLayer() ? '_cluster' : '_layer';
        featureLayer[layer].remove();
        featureLayer[layer] = undefined;

        var index = this.featureLayers.indexOf(featureLayer);
        if (index > -1) {
            this.featureLayers.splice(index, 1);
        }
        this.rebuildLayersControl();
    }

    private removeFeatureFromLayer(feature: Feature, featureLayer: FeatureLayer) {
        featureLayer['_layer'].removeLayer(feature['_layer']);
        feature['_layer'] = undefined;

        if (featureLayer.isClusterLayer()) {
            featureLayer['_cluster'].clearLayers();
            featureLayer['_cluster'].addLayer(featureLayer['_layer']);
        }
    }

    

    private getFeatureLayersForControl(): { name: string, layer: any }[] {
        return this.featureLayers
            .filter(f => f.getControlName() != undefined)
            .map(f => {
                return {
                    name: f.getControlName(),
                    layer: f.isClusterLayer() ? f['_cluster'] : f['_layer']
                };
            });
    }

    private buildLayersControl(): L.Control.Layers {
        if (this.mapTileDefault == undefined) {
            this.mapTileDefault = L.tileLayer(this.mapTiles[0].url, this.mapTiles[0].props);
        }

        const tilesMap = {}, layerMap = {};

        this.mapTiles.forEach((tileConf, index) => {
            tilesMap[tileConf.name] = index == 0 ? this.mapTileDefault : L.tileLayer(tileConf.url, tileConf.props);
        });

        this.getFeatureLayersForControl().forEach(fl => {
            layerMap[fl.name] = fl.layer;
        });

        return L.control.layers(tilesMap, layerMap, {
            position: this.config.layersControlPosition as L.ControlPosition
        });
    }

    private onClickFeature(feature: Feature, mapFeatureLayer: MapFeatureLayer) {
        mapFeatureLayer.pushFeatureSelected(feature);
    }

    private onLocationFound(event) {
        this.userLocService.setCurrentLocation({
            lat: event.latlng.lat,
            lng: event.latlng.lng
        });
    }

    private buildButtonsControl(config: MapConfig, map: L.Map) {
        if (config.buttons) {
            config.buttons.forEach(button => {

                const btn = L.easyButton({
                    id: button.id,
                    position: button.position,
                    states: [
                        {
                            stateName: button.title,
                            title: button.title,
                            icon: button.icon,
                            onClick: button.clickFunction
                        }
                    ]
                }).addTo(map);

                if (button.styleMap) {
                    Object.keys(button.styleMap).forEach(key => btn['button'].style[key] = button.styleMap[key]);
                }

                if (button.containerStyleMap) {
                    Object.keys(button.containerStyleMap).forEach(key => btn['_bar']['container'].style[key] = button.containerStyleMap[key]);
                }
            });
        }
    }

    private LOCATION_OPTIONS:L.Control.LocateOptions = {
        position: 'bottomright',
        drawCircle: false,
        setView: false,
        drawMarker: true,
        icon: 'fa fa-crosshairs',
        locateOptions: {
          setView: false,
          enableHighAccuracy: true
        },
        strings: {
          popup: 'Sua localização',
          title: 'Minha localização'
        },
        clickBehavior: {
            inView: 'setView',
            outOfView: 'setView',
            inViewNotFollowing: 'inView'
        },
        onLocationError: (err) => {}
    };

}
