import { Subscription } from 'rxjs';
import { Feature } from '../../models/feature';
import { FeatureLayer } from '../../models/feature-layer';

export interface MapFeatureLayer {

    featureLayer: FeatureLayer;

    subscribeForAdd(sub: (feature: Feature) => void): Subscription;

    subscribeForRemove(sub: (feature: Feature) => void): Subscription;

    subscribeForRemoveLayer(sub: (feature: FeatureLayer) => void): Subscription;

    subscribeForFocus(sub: (feature: Feature) => void): Subscription;

    pushFeatureSelected(feature: Feature);
}