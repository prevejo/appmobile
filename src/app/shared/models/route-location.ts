import { Location } from '../services/locations.service';
import { PointLocation } from './point-location';
import { Observable, Subscribable, of, throwError } from 'rxjs';
import { FeatureLayer } from './feature-layer';
import { RoutePosition, StartRoutePosition, EndRoutePosition } from './route-location-entry';
import { StartPointFeatureShape } from './start-point-feature-shape';
import { EndPointFeatureShape } from './end-point-feature-shape';
import { Parada } from './parada';

export interface RouteLocation {
    type: RouteLocationType;
    getDescription(): string;
    getServiceId(): string;
    toFeatureLayer(routePosition: RoutePosition): FeatureLayer;
    toMap(): Observable<{[key: string]: string}>;
}


declare type TypeDescription = 'google_place' | 'bus_stop' | 'point' | 'current';

interface RouteLocationType {
    description: TypeDescription;
    serviceType: string;
}

const PLACE: RouteLocationType = {
    description: 'google_place',
    serviceType: 'LOCATION'
};
export const STOP: RouteLocationType = {
    description: 'bus_stop',
    serviceType: 'PARADA'
};
export const TYPE_CURRENT: RouteLocationType = {
    description: 'current',
    serviceType: 'LOCATION'
}
const POINT: RouteLocationType = {
    description: 'point',
    serviceType: 'LOCATION'
};

export const buildMap: {[key: string]: (map: {[key: string]: string}) => Subscribable<RouteLocation>} = {
    'google_place': (map: {[key: string]: string}) => PlaceRouteLocation.fromMap(map),
    'bus_stop': (map: {[key: string]: string}) => ParadaRouteLocation.fromMap(map),
    'current': (map: {[key: string]: string}) => CurrentRouteLocation.fromMap(map)
};



export class PlaceRouteLocation implements RouteLocation {
    type: RouteLocationType = PLACE;

    static fromMap(map: {[key: string]: string}): Subscribable<RouteLocation> {
        if (map['locationName'] && map['locLat'] && map['locLng']) {
            return of(new PlaceRouteLocation({
                name: map['locationName'],
                location: {
                    lat: Number(map['locLat']),
                    lng: Number(map['locLng'])
                }
            }));
        }

        return throwError('Parâmetros não encontrados');
    }

    constructor(private location: Location) {}

    getDescription(): string {
        return this.location.name;
    }

    getLocation(): Location {
        return this.location;
    }

    getServiceId(): string {
        return this.getLocation().location.lat + '_' + this.getLocation().location.lng;
    }

    toFeatureLayer(routePosition: RoutePosition): FeatureLayer {
        const featureLayer: FeatureLayer = FeatureLayer.fromLocation(this.getLocation());

        if (routePosition instanceof StartRoutePosition) {
            featureLayer.setShape(new StartPointFeatureShape());
        } else if (routePosition instanceof EndRoutePosition) {
            featureLayer.setShape(new EndPointFeatureShape());
        }

        return featureLayer;
    }

    toMap(): Observable<{[key: string]: string}> {
        return of({
            type: this.type.description,
            locationName: this.getLocation().name,
            locLat: String(this.getLocation().location.lat),
            locLng: String(this.getLocation().location.lng)
        });
    }
}

export class CurrentRouteLocation implements RouteLocation {

    type: RouteLocationType = TYPE_CURRENT;
    private pointLocation: PointLocation;

    static fromMap(map: {[key: string]: string}): Subscribable<RouteLocation> {
        if (map['pointLat'] && map['pointLng']) {
            return of(new CurrentRouteLocation({
                lat: Number(map['pointLat']),
                lng: Number(map['pointLng'])
            }));
        }

        return throwError('Parâmetros não encontrados');
    }

    constructor(pl: PointLocation | Observable<PointLocation>) {
        if (pl instanceof Observable) {
            pl.subscribe(p => this.setPointLocation(p));
        } else {
            this.setPointLocation(pl);
        }
    }

    getDescription(): string {
        return 'Meu local';
    }

    getServiceId(): string {
        return this.getPointLocation().lat + '_' + this.getPointLocation().lng;
    }

    getPointLocation(): PointLocation {
        return this.pointLocation;
    }

    private setPointLocation(pl: PointLocation) {
        this.pointLocation = pl;
    }

    toFeatureLayer(routePosition: RoutePosition): FeatureLayer {
        const featureLayer: FeatureLayer = FeatureLayer.fromPointLocation(this.getPointLocation());

        if (routePosition instanceof StartRoutePosition) {
            featureLayer.setShape(new StartPointFeatureShape());
        } else if (routePosition instanceof EndRoutePosition) {
            featureLayer.setShape(new EndPointFeatureShape());
        }

        return featureLayer;
    }

    toMap(): Observable<{[key: string]: string}> {
        if (this.getPointLocation() === undefined) {
            return throwError('Localização não definida');
        }

        return of({
            type: this.type.description,
            pointLat: String(this.getPointLocation().lat),
            pointLng: String(this.getPointLocation().lng)
        });
    }
}

export class ParadaRouteLocation implements RouteLocation {
    type: RouteLocationType = STOP;

    static fromMap(map: {[key: string]: string}): Subscribable<RouteLocation> {
        if (map['cod'] && map['paradaLng'] && map['paradaLat']) {
            return of(new ParadaRouteLocation({
                cod: map['cod'],
                geo: {
                    type: 'Point',
                    coordinates: [
                        Number(map['paradaLng']),
                        Number(map['paradaLat'])
                    ]
                }
            }));
        }

        return throwError('Parâmetros não encontrados');
    }

    constructor(private parada: Parada) {}

    getDescription(): string {
        return 'Parada ' + this.parada.cod;
    }

    getServiceId(): string {
        return this.getParada().cod;
    }

    getParada(): Parada {
        return this.parada;
    }

    toFeatureLayer(routePosition: RoutePosition): FeatureLayer {
        const featureLayer: FeatureLayer = FeatureLayer.fromParada(this.getParada());

        if (routePosition instanceof StartRoutePosition) {
            featureLayer.setShape(new StartPointFeatureShape());
        } else if (routePosition instanceof EndRoutePosition) {
            featureLayer.setShape(new EndPointFeatureShape());
        }

        return featureLayer;
    }

    toMap(): Observable<{[key: string]: string}> {
        return of({
            type: this.type.description,
            cod: this.getParada().cod,
            paradaLng: String(this.getParada().geo.coordinates[0]),
            paradaLat: String(this.getParada().geo.coordinates[1])
        });
    }

}
