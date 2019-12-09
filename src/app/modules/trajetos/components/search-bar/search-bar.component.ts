import { Component, Input, OnInit, ViewEncapsulation, EventEmitter, Output, SimpleChanges, SimpleChange, OnChanges } from '@angular/core';
import { LocationsService, LocationsSession, LocationSearchResult } from 'src/app/shared/services/locations.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SearchBarComponent implements OnInit {

    @Input()
    public results: Subject<LocationSearchResult[]>;
    @Output()
    public onFocus: EventEmitter<any> = new EventEmitter();
    @Input()
    public placeHolder: string;

    public _value: string;
    @Output() 
    public valueChange = new EventEmitter();

    private filterString: Subject<string> = new Subject<string>();
    private searchSession: LocationsSession;

    public loadIndicator = new Subject<boolean>();

    constructor(locationsService: LocationsService) {
        this.searchSession = locationsService.createSession();
    }

    ngOnInit() {
        this.filterString.pipe(debounceTime(250)).subscribe(searchValue => {
            this.loadIndicator.next(true);
            this.searchSession.search(searchValue).subscribe(results => {
                this.loadIndicator.next(false);
                this.results.next(results);
            });
        });
    }

    onInput(event: any) {
        const value = event.target.value;
        this.filterString.next(value);
    }

    @Input()
    get value() {
        return this._value;
    }

    set value(val) {
        this._value = val;
        this.valueChange.emit(this._value);
    }

}
