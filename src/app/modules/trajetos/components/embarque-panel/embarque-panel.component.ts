import { Component, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { EmbarqueState, ColorfulEmbarque, EmbarqueCollection } from '../../embarque-state.service';
import { flatMap, map } from 'rxjs/operators';
import { EmbarqueList } from '../embarque-list/embarque-list.component';

@Component({
    selector: 'embarque-panel',
    templateUrl: './embarque-panel.component.html',
    styleUrls: ['./embarque-panel.component.scss']
})
export class EmbarquePanelComponent implements AfterViewInit {

    @Output()
    public btnVoltarClick: EventEmitter<any> = new EventEmitter();
    @Output()
    public btnAlertaClick: EventEmitter<any> = new EventEmitter();
    @Input()
    public embarqueState: Observable<EmbarqueState>;

    private _state: EmbarqueState;
    public embarquesList$: Observable<EmbarqueList>;


    ngAfterViewInit() {
        this.embarquesList$ = this.embarqueState
            .pipe(flatMap(state => state.embarqueCollection.embarquesObservable().pipe(map(embs => {
                return {
                    collection: state.embarqueCollection,
                    embarques: embs.sort((a, b) =>
                        a.embarque.tempoRestante === b.embarque.tempoRestante ? 0 :
                        a.embarque.tempoRestante > b.embarque.tempoRestante ? 1 : -1)
                };
            }))))
            .pipe(map(result => new EmbarqueListImpl(result.collection, result.embarques)));

        this.embarqueState.subscribe(state => {
            this._state = state;
        });
    }

    onClickEmbarque(embarque: ColorfulEmbarque) {
        if (this._state) {
            this._state.embarqueCollection.selecionarVeiculo(embarque);
        }
    }

    onClickBtnVoltar(event) {
        this.btnVoltarClick.emit(event);
    }

    onClickBtnAlerta(event) {
        this.btnAlertaClick.emit(event);
    }

    isSelecionado(embarque: ColorfulEmbarque): boolean {
        if (this._state) {
            return this._state.embarqueCollection.isSelecionado(embarque);
        }

        return false;
    }

}
class EmbarqueListImpl implements EmbarqueList {

    constructor(private embarqueCollection: EmbarqueCollection, public embarques: ColorfulEmbarque[]) {}

    isSelecionado(embarque: ColorfulEmbarque): boolean {
        return this.embarqueCollection.isSelecionado(embarque);
    }

    selecionarEmbarque(embarque: ColorfulEmbarque): void {
        this.embarqueCollection.selecionarVeiculo(embarque);
    }

}
