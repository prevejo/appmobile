import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PercursoOperacao } from '../../linha-state-service';
import { Operador } from 'src/app/shared/models/operador';

@Component({
    selector: 'linha-panel',
    templateUrl: './linha-panel.component.html',
    styleUrls: ['./linha-panel.component.scss']
})
export class LinhaPanelComponent implements OnInit {

    @Input()
    public operacao: PercursoOperacao;
    @Output()
    public onClickBtnHorarios: EventEmitter<any> = new EventEmitter();
    @Output()
    public onClickBtnVeiculos: EventEmitter<any> = new EventEmitter();

    public operadores: Operador[];

    ngOnInit() {
        const operadoresMap: Map<number, Operador> = new Map();

        this.operacao.gruposHorarios
            .map(gh => gh.partidas.map(p => p.operador))
            .reduce((prev, next) => prev.concat(next), [])
            .forEach(op => operadoresMap.set(op.id, op));

        this.operadores = Array.from(operadoresMap.values());
    }

}