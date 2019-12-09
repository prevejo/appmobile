import { Feature } from './feature';
import { FeatureShape } from './feature-shape';
import { FeatureCollection } from 'geojson';
import { Location } from '../services/locations.service';
import { PointFeatureShape } from './point-feature-shape';
import { PointLocation } from './point-location';
import { Parada } from './parada';

export class FeatureLayer {

    private features: Feature[];
    private shape: FeatureShape;
    private cluster: boolean = false;
    private focusAffterAdd: boolean = false;
    private controlName: string;

    constructor(features: Feature[], shape?: FeatureShape, cluster?: boolean, controlName?: string, focusAffterAdd?: boolean) {
        this.setFeatures(features);
        this.setShape(shape);
        this.controlName = controlName;

        if (cluster) {
            this.cluster = true;
        }
        if (focusAffterAdd) {
            this.focusAffterAdd = true;
        }
    }

    getControlName(): string {
        return this.controlName;
    }

    getFeatures(): Feature[] {
        return this.features;
    }

    setFeatures(features: Feature[]) {
        this.features = features;
    }

    getShape(): FeatureShape {
        return this.shape;
    }

    setShape(shape: FeatureShape) {
        this.shape = shape;
    }

    isClusterLayer(): boolean {
        return this.cluster;
    }

    isFocusAffterAdd(): boolean {
        return this.focusAffterAdd;
    }

    setFocusAffterAdd(focus: boolean) {
        this.focusAffterAdd = focus;
    }

    static fromFeatures(features: Feature[], props?: {
        cluster?: boolean,
        shape?: FeatureShape,
        controlName?: string,
        focusAffterAdd?: boolean
    }): FeatureLayer {
        let focusAffterAdd: boolean = false;
        let cluster: boolean = false;
        let shape: FeatureShape = undefined;
        let controlName: string = undefined;
        if (props) {
            cluster = props.cluster;
            shape = props.shape;
            controlName = props.controlName;
            focusAffterAdd = props.focusAffterAdd;
        }

        return new FeatureLayer(features, shape, cluster, controlName, focusAffterAdd);
    }

    static fromCollection(fc: FeatureCollection, props?: {
        cluster?: boolean,
        shape?: FeatureShape,
        controlName?: string,
        focusAffterAdd?: boolean
    }): FeatureLayer {
        return this.fromFeatures(fc.features.map(f => Feature.fromGeojson(f)), props);
    }

    static fromFeature(feature: Feature): FeatureLayer {
        return new FeatureLayer([feature]);
    }

    static fromLocation(location: Location): FeatureLayer {
        return this.fromFeatures([Feature.fromLocation(location)], {
            shape: new PointFeatureShape(),
            focusAffterAdd: true
        });
    }

    static fromPointLocation(point: PointLocation, props?: any): FeatureLayer {
        const fl: FeatureLayer = this.fromFeature(Feature.fromPoint(point, props));
        fl.setShape(new PointFeatureShape());
        return fl;
    }

    static fromParada(parada: Parada): FeatureLayer {
        const fl: FeatureLayer = this.fromFeature(Feature.fromGeoPoint(parada.geo, {
            codigo: parada.cod
        }));
        fl.setShape(new PointFeatureShape());
        return fl;
    }
    
}