import { FeatureShape } from './feature-shape';
import { Feature } from './feature';
import { Icon, Layer, marker, LatLng, PathOptions, IconOptions } from 'leaflet';

export class PointFeatureShape implements FeatureShape {

    private options: IconOptions = {
        iconUrl:       'assets/leaflet/marker-icon.png',
        iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
        shadowUrl:     'assets/leaflet/marker-shadow.png',
        iconSize:    [25, 41],
        iconAnchor:  [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
        shadowSize:  [41, 41]
    };

    constructor(options?: IconOptions) {
        if (options) {
            this.options = options;
        }
    }
    
    style(): (feature: Feature) => PathOptions {
        return undefined;
    }

    pointToLayer(): (feature: Feature, latLng: LatLng) => Layer {
        return (f, l) => {
            return marker(l, {
                icon: new (Icon.extend({
                    options: this.options
                }))
            });
        };
    }

}