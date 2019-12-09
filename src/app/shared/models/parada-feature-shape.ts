import { PathOptions, LatLng, Layer, marker, AwesomeMarkers } from 'leaflet';
import { FeatureShape } from './feature-shape';
import { Feature } from './feature';

export declare type ShapeColor = "blue" | "red" | "darkred" | "orange" | "green" | "darkgreen" | "purple" | "darkpurple" | "cadetblue";

export class ParadaFeatureShape implements FeatureShape {

    constructor(private color?: ShapeColor) {}
        
    style(): (feature: Feature) => PathOptions {
        if (this.color) {
            return f => {
                return {
                    color: this.color
                }
            };
        }

        return undefined;
    }

    pointToLayer(): (feature: Feature, latLng: LatLng) => Layer {
        return (f, l) => {
            return marker(l, {
                icon: AwesomeMarkers.icon({
                    icon: 'bus',
                    markerColor: this.color ? this.color : 'blue',
                    prefix: 'fa',
                    iconSize: [35, 45],
                    iconAnchor:   [17, 42],
                    popupAnchor: [1, -32],
                    shadowAnchor: [10, 12],
                    shadowSize: [36, 16]
                })
            });
        };
    }

}