import { PathOptions, LatLng, Layer, marker, AwesomeMarkers, divIcon } from 'leaflet';
import { FeatureShape } from './feature-shape';
import { Feature } from './feature';

export declare type ShapeColor = "blue" | "red" | "darkred" | "orange" | "green" | "darkgreen" | "purple" | "darkpurple" | "cadetblue";

export class BusFeatureShape implements FeatureShape {

    constructor(private color?: ShapeColor) {}
        
    style(): (feature: Feature) => PathOptions {
        if (this.color) {
            return f => {
                return {
                    color: this.color,
                    opacity: 1,
                    fillOpacity: 1
                }
            };
        }

        return undefined;
    }

    pointToLayer(): (feature: Feature, latLng: LatLng) => Layer {
        return (f, l) => {
            return marker(l, {
                /*icon: divIcon({
                    className: 'custom-div-icon',
                    html: "<div style='background-color:" + this.color + "; box-shadow: inset 0px 0px 2px 0px rgb(0, 0, 0), 0px 0px 3px 0px rgb(0,0,0);' class='marker-pin'></div><i class='fa fa-bus awesome'>",
                    iconSize: [30, 42],
                    iconAnchor: [15, 42]
                })*/

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