import { PathOptions, LatLng, Layer, marker, AwesomeMarkers } from 'leaflet';
import 'leaflet.awesome-markers';
import { FeatureShape } from './feature-shape';
import { Feature } from './feature';

export class EndPointFeatureShape implements FeatureShape {
        
    style(): (feature: Feature) => PathOptions {
        return undefined;
    }

    pointToLayer(): (feature: Feature, latLng: LatLng) => Layer {
        return (f, l) => {
            return marker(l, {
                icon: AwesomeMarkers.icon({
                    icon: 'sign-out',
                    markerColor: 'cadetblue',
                    prefix: 'fa'
                })
            });
        };
    }

}