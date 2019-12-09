import { Injectable } from '@angular/core';
import { RouteLocation, TYPE_CURRENT, CurrentRouteLocation } from 'src/app/shared/models/route-location';
import { Subject, ReplaySubject, Subscription } from 'rxjs';
import { UserLocationService } from 'src/app/shared/services/user-location.service';
import { RouteLocationEntry, EndRouteLocationEntry, StartRouteLocationEntry } from 'src/app/shared/models/route-location-entry';

@Injectable()
export class RoutePanelStateService {

    private currentLocation: CurrentRouteLocation;

    constructor(userLocService: UserLocationService) {
        this.currentLocation = userLocService.getCurrentLocation();
    }

    instanceState(): RoutePanelState {
        return new RoutePanelStateImpl(this.currentLocation);
    }
}


export interface RoutePanelState {
    setRouteLocation(rl: RouteLocation): RouteLocationEntry;
    setRouteLocationAsCurrent(): void;
    resetStartLocation(): void;
    resetEndLocation(): void;
    isStartLocationDefined(): boolean;
    isEndLocationdefined(): boolean;
    getStartLocation(): RouteLocation;
    getEndLocation(): RouteLocation;
    subscribeForRemove(sub: (rl: RouteLocationEntry) => void): Subscription;
    subscribeForAdd(sub: (rl: RouteLocationEntry) => void): Subscription;
}


class RoutePanelStateImpl implements RoutePanelState {

    private startRouteLocation: RouteLocationEntry;
    private endRouteLocation: RouteLocationEntry;

    private addControl: Subject<RouteLocationEntry> = new ReplaySubject<RouteLocationEntry>();
    private removeControl: Subject<RouteLocationEntry> = new ReplaySubject<RouteLocationEntry>();

    constructor(private currentLocation: CurrentRouteLocation) {
        this.startRouteLocation = new StartRouteLocationEntry(this.currentLocation);
    }

    setRouteLocation(rl: RouteLocation): RouteLocationEntry {
        if (this.isStartLocationDefined()) {
            if (!(rl.type == TYPE_CURRENT && this.startRouteLocation.getRouteLocation().type == TYPE_CURRENT)) {
                if (this.endRouteLocation != undefined) {
                    this.sinalizeRemove(this.endRouteLocation);
                }
                this.endRouteLocation = new EndRouteLocationEntry(rl);
                this.sinalizeAdd(this.endRouteLocation);

                return this.endRouteLocation;
            }
        } else {
            if (!(rl.type == TYPE_CURRENT && this.isEndLocationdefined() && this.endRouteLocation.getRouteLocation().type == TYPE_CURRENT)) {
                if (this.startRouteLocation != undefined) {
                    this.sinalizeRemove(this.startRouteLocation);
                }
                this.startRouteLocation = new StartRouteLocationEntry(rl);
                this.sinalizeAdd(this.startRouteLocation);

                return this.startRouteLocation;
            }
        }

        return null;
    }

    setRouteLocationAsCurrent() {
        this.setRouteLocation(this.currentLocation);
    }

    resetStartLocation() {
        this.sinalizeRemove(this.startRouteLocation);
        this.startRouteLocation = undefined;
    }

    resetEndLocation() {
        this.sinalizeRemove(this.endRouteLocation);
        this.endRouteLocation = undefined;
    }

    isStartLocationDefined() {
        return this.startRouteLocation != undefined;
    }

    isEndLocationdefined() {
        return this.endRouteLocation != undefined;
    }

    getStartLocation(): RouteLocation {
        return this.startRouteLocation.getRouteLocation();
    }

    getEndLocation(): RouteLocation {
        return this.endRouteLocation.getRouteLocation();
    }
    

    subscribeForRemove(sub: (rl: RouteLocationEntry) => void): Subscription {
        return this.removeControl.subscribe(sub);
    }

    subscribeForAdd(sub: (rl: RouteLocationEntry) => void): Subscription {
        return this.addControl.subscribe(sub);
    }

    private sinalizeRemove(rl: RouteLocationEntry) {
        this.removeControl.next(rl);
    }

    private sinalizeAdd(rl: RouteLocationEntry) {
        this.addControl.next(rl);
    }
}