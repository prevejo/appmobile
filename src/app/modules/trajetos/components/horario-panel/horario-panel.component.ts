import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, SimpleChange } from '@angular/core';
import { PercursoOperacao } from '../../linha-state-service';
import { GrupoHorario } from 'src/app/shared/models/grupo-horario';

@Component({
    selector: 'horario-panel',
    templateUrl: './horario-panel.component.html',
    styleUrls: ['./horario-panel.component.scss']
})
export class HorarioPanelComponent implements OnChanges {

    @Input()
    public operacao: PercursoOperacao;

    @Output()
    public onClickBtnVoltar: EventEmitter<any> = new EventEmitter();

    public grupo: GrupoHorario;

    nextGrupo() {
        this.grupo = this.operacao.gruposHorarios[this.operacao.gruposHorarios.indexOf(this.grupo) + 1];
    }

    previousGrupo() {
        this.grupo = this.operacao.gruposHorarios[this.operacao.gruposHorarios.indexOf(this.grupo) - 1];
    }

    canNext(): boolean {
        const index = this.operacao.gruposHorarios.indexOf(this.grupo);
        return index != -1 && index < this.operacao.gruposHorarios.length - 1;
    }

    canPrevious(): boolean {
        return this.operacao.gruposHorarios.indexOf(this.grupo) > 0;
    }

    ngOnChanges(changes: SimpleChanges): void {
        const operacaoChange: SimpleChange = changes.operacao;

        if (operacaoChange && operacaoChange.currentValue) {
            const operacao: PercursoOperacao = operacaoChange.currentValue;

            this.grupo = operacao.gruposHorarios[0];
        }
    }

}