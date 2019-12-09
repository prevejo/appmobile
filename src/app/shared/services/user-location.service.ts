import { Subject, Observable } from 'rxjs';
import { PointLocation } from '../models/point-location';
import { Injectable } from '@angular/core';
import { CurrentRouteLocation } from '../models/route-location';

@Injectable({
    providedIn: 'root'
})
export class UserLocationService {

    private history: PointLocation[] = [];
    private currentLocation: Subject<PointLocation> = new Subject<PointLocation>();
    private userLocation: CurrentRouteLocation;

    constructor() {
        this.currentLocation.subscribe(pl => this.history.push(pl));
        this.userLocation = new CurrentRouteLocation(this.asObservable());
    }

    getCurrentLocation(): CurrentRouteLocation {
        return this.userLocation;
    }

    asObservable() : Observable<PointLocation> {
        return this.currentLocation.asObservable();
    }

    setCurrentLocation(pointLoc: PointLocation) {
        this.currentLocation.next(pointLoc);
    }

}