import { Component, Output, EventEmitter, Input } from '@angular/core';
import { PercursoSet } from '../../veiculos-store.service';

@Component({
    selector: 'registrados-panel',
    templateUrl: './registrados-panel.component.html',
    styleUrls: ['./registrados-panel.component.scss']
})
export class RegistradosPanelComponent {

    @Input()
    public sets: PercursoSet[] = [];

    @Output()
    public onClickBtnNovo: EventEmitter<any> = new EventEmitter();

    @Output()
    public onSetSelecionado: EventEmitter<PercursoSet> = new EventEmitter();


}