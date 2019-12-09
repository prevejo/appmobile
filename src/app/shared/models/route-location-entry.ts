import { RouteLocation } from './route-location';
import { FeatureLayer } from './feature-layer';

export interface RoutePosition {
    type: string
}

export class StartRoutePosition implements RoutePosition {
    type: 'start'
}

export class EndRoutePosition implements RoutePosition {
    type: 'end'
}

export interface RouteLocationEntry {
    getRouteLocation(): RouteLocation;
    getPostion(): RoutePosition;
    toFeatureLayer(): FeatureLayer;
}

class RouteLocationImpl implements RouteLocationEntry {
    constructor(private routeLocation: RouteLocation, private position: RoutePosition) {
    }

    getRouteLocation(): RouteLocation {
        return this.routeLocation;
    }

    getPostion(): RoutePosition {
        return this.position;
    }
    
    toFeatureLayer(): FeatureLayer {
        return this.getRouteLocation().toFeatureLayer(this.getPostion());
    }
}

export class StartRouteLocationEntry extends RouteLocationImpl {
    constructor(routeLocation: RouteLocation) {
        super(routeLocation, new StartRoutePosition());
    }
}

export class EndRouteLocationEntry extends RouteLocationImpl {
    constructor(routeLocation: RouteLocation) {
        super(routeLocation, new EndRoutePosition());
    }
}