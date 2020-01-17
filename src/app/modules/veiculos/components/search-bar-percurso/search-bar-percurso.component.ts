import { Component, Input, OnInit, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PercursoService } from 'src/app/shared/services/percurso.service';
import { Percurso } from 'src/app/shared/models/percurso';

@Component({
    selector: 'search-bar-percurso',
    templateUrl: './search-bar-percurso.component.html',
    styleUrls: ['./search-bar-percurso.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SearchBarPercursoComponent implements OnInit {

    @Input()
    public results: Subject<Percurso[]>;
    @Output()
    public onFocus: EventEmitter<any> = new EventEmitter();
    @Input()
    public placeHolder: string;

    @Input()
    public minLength: number;

    public _value: string;
    @Output() 
    public valueChange = new EventEmitter();

    private filterString: Subject<string> = new Subject<string>();

    public loadIndicator = new Subject<boolean>();

    private _currentSub: Subscription = null;

    constructor(private percursoService: PercursoService) {}

    ngOnInit() {
        this.filterString.pipe(debounceTime(250)).subscribe(searchValue => {
            if (searchValue.length > 0) {
                if (this._currentSub != null) {
                    this._currentSub.unsubscribe();
                }
                
                this.loadIndicator.next(true);
                this._currentSub = this.percursoService.obterPercursosByDescricao(searchValue).subscribe(results => {
                    this.loadIndicator.next(false);
                    this.results.next(results);
                });
            } else {
                this.results.next([]);
            }
        });
    }

    onInput(event: any) {
        const value = event.target.value;

        if (value == undefined || value.length != 0) {
            if (this.minLength != undefined && value != undefined && value.length < this.minLength) {
                return;
            }
        }

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
