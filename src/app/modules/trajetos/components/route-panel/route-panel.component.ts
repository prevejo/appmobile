import { Component, Input, OnInit } from '@angular/core';
import { PlaceRouteLocation } from 'src/app/shared/models/route-location';
import { LocationSearchResult, LocationsService } from 'src/app/shared/services/locations.service';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { RoutePanelState } from '../../route-panel-state.service';

@Component({
    selector: 'route-panel',
    templateUrl: './route-panel.component.html',
    styleUrls: ['./route-panel.component.scss']
})
export class RoutePanelComponent implements OnInit {
    public searchBarValue: string;

    public items: Subject<LocationSearchResult[]> = new BehaviorSubject<LocationSearchResult[]>([]);
    public itemsObservable: Observable<LocationSearchResult[]> = this.items.asObservable();

    @Input()
    public resultListShowControl: Subject<boolean> = new BehaviorSubject<boolean>(true);
    @Input()
    public locationRequest: Observable<any>;
    @Input()
    public state: RoutePanelState;

    constructor(private locService: LocationsService) {}

    ngOnInit() {
        this.locationRequest.subscribe(() => this.state.setRouteLocationAsCurrent());
    }
    
    onItemSelecionado(item: LocationSearchResult) {
        this.locService.detail(item).subscribe(location => {
            this.state.setRouteLocation(new PlaceRouteLocation(location))

            this.resultListShowControl.next(false);
            this.resetSearchBarValue();
        });
    }

    private resetSearchBarValue() {
        this.searchBarValue = null;
        this.items.next([]);
    }

    onSearchBarFocus(event) {
        this.resultListShowControl.next(true);
    }

    onClickStartLocation() {
        this.state.resetStartLocation();
    }

    onClickEndLocation() {
        this.state.resetEndLocation();
    }
}