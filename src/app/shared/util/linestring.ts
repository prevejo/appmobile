import * as GeoJson from 'geojson';
import * as L from 'leaflet';
import { Feature } from '../models/feature';

export class LineString {

    private constructor(private linestring: GeoJson.LineString) {}

    public firstCut(startPoint: GeoJson.Point, endPoint: GeoJson.Point): LineString {

        const startLatLng: L.LatLng = L.latLng(startPoint.coordinates[1], startPoint.coordinates[0]);
        const endLatLng: L.LatLng = L.latLng(endPoint.coordinates[1], endPoint.coordinates[0]);

        const linestrLatLng = this.linestring.coordinates.map((position, i) => {
            const latLng = L.latLng(position[1], position[0]);

            return {
                position: position,
                index: i,
                startDistance: latLng.distanceTo(startLatLng),
                endDistance: latLng.distanceTo(endLatLng)
            };
        });

        let coordinates = [];

        if (linestrLatLng.length > 0) {
            const minToStart = Math.min(...linestrLatLng.map(ll => ll.startDistance));
            const latLngStart = linestrLatLng.filter(ll => ll.startDistance == minToStart)[0];

            const linestrLatLngAfterStart = linestrLatLng.slice(latLngStart.index);

            if (linestrLatLngAfterStart.length > 0) {
                const minToEnd = Math.min(...linestrLatLngAfterStart.map(ll => ll.endDistance));
                const latLngEnd = linestrLatLngAfterStart.filter(ll => ll.endDistance == minToEnd)[0];

                coordinates = linestrLatLng.slice(latLngStart.index, latLngEnd.index + 1).map(ll => ll.position);
            }
        }

        return new LineString({
            type: 'LineString',
            coordinates: coordinates
        });;
    }

    public totalDistance(): number {
        const total = this.linestring.coordinates
            .map(coords => L.latLng(coords[1], coords[0]))
            .reduce((prev, next) => {
                if (prev.latLng == null) {
                    prev.latLng = next;
                } else {
                    prev.sum += next.distanceTo(prev.latLng)
                    prev.latLng = next;
                }

                return prev;
            }, {
                sum: 0,
                latLng: null
            });

        return total.sum;
    }

    toFeature(props?: any): Feature {
        return Feature.fromGeojson({
            type: 'Feature',
            geometry: this.linestring,
            properties: props ? props : {}
        });
    }

    static fromLinestring(linestring: GeoJson.LineString): LineString {
        return new LineString(linestring);
    }

}