import { Feature } from './feature';

export interface FeatureShape {
    
    pointToLayer(): (feature: Feature, latLng: L.LatLng) => L.Layer;
    style(): (feature: Feature) => L.PathOptions;

}