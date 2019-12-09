import { Component, Input } from '@angular/core';
import { ColorfulEmbarque } from '../../embarque-state.service';

@Component({
    selector: 'embarque-list',
    templateUrl: './embarque-list.component.html',
    styleUrls: ['./embarque-list.component.scss']
})
export class EmbarqueListComponent {

    @Input()
    public embarqueList: EmbarqueList;

}

export interface EmbarqueList {

    embarques: ColorfulEmbarque[];
    isSelecionado(embarque: ColorfulEmbarque): boolean;
    selecionarEmbarque(embarque: ColorfulEmbarque): void;

}
