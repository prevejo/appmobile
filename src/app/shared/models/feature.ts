import * as GeoJson from 'geojson';
import { Location } from '../services/locations.service';
import { PointLocation } from './point-location';

export class Feature {

    private geoJson: GeoJson.Feature;

    constructor(geoJson: GeoJson.Feature) {
        this.geoJson = geoJson;
    }

    getGeoJson(): GeoJson.Feature {
        return this.geoJson;
    }

    static fromGeojson(geoJson: GeoJson.Feature): Feature {
        return new Feature(geoJson);
    }

    static fromLocation(location: Location): Feature {
        return this.fromPoint(location.location, {
            name: location.name
        });
    }

    static fromGeoPoint(point: GeoJson.Point, props?: any) {
        return this.fromPoint({
            lat: point.coordinates[1],
            lng: point.coordinates[0]
        }, props);
    }

    static fromPoint(point: PointLocation, props?: any): Feature {
        const geoJson: GeoJson.Feature = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [point.lng, point.lat]
            },
            properties: props ? props : {}
        };

        return new Feature(geoJson);
    }

}