import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { LocationSearchResult } from 'src/app/shared/services/locations.service';

@Component({
    selector: 'result-list',
    templateUrl: './result-list.component.html',
    styleUrls: ['./result-list.component.scss']
})
export class ResultListComponent {

    @Input()
    public items: Observable<LocationSearchResult>;
    @Output()
    public onItemSelected: EventEmitter<LocationSearchResult> = new EventEmitter();

    onItemClick(item: LocationSearchResult) {
        this.onItemSelected.emit(item);
    }
    
}