import { Feature } from '../../models/feature';
import { FeatureLayer } from '../../models/feature-layer';

export interface ClientFeatureLayer {

    featureLayer: FeatureLayer;

    addFeature(feature: Feature): void;
    removeFeature(feature: Feature): void;
    focusFeature(feature: Feature): void;
    removeLayer(): void;
    subscribeForSelect(sub: (feature: Feature) => void);
}