import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PercursoEmbarqueState } from '../../embarque-state.service';
import { Percurso } from 'src/app/shared/models/percurso';

@Component({
    selector: 'alerta-form',
    templateUrl: './alerta-form.component.html',
    styleUrls: ['./alerta-form.component.scss']
})
export class AlertaFormComponent implements OnInit {

    @Input()
    public embarques: PercursoEmbarqueState[];
    @Output()
    public alertaConfirmado: EventEmitter<AlertaConfirmado> = new EventEmitter();

    tipo: 'TEMPO' | 'DISTANCIA' = 'TEMPO';
    tempo = new AlertaInput(1, 1, 30);
    distancia = new AlertaInput(1, 1, 30);

    embarquesMap: Map<string, Percurso[]> = new Map();

    ngOnInit() {
        this.setEmbarquesMap(this.embarques);
    }

    onClickBtnDefinir() {
        this.alertaConfirmado.emit({
            type: this.tipo,
            value: this.currentValue()
        });
    }

    onInputBlur(event: CustomEvent, modelValue: number) {
        const input: HTMLIonInputElement = event.target as HTMLIonInputElement;

        if (input.value !== String(modelValue)) {
            input.value = String(modelValue);
        }
    }

    percursosList(percursos: Percurso[]): string {
        return percursos.map(perc => perc.linha.numero).join(', ');
    }

    private currentValue(): number {
        return this.tipo == 'DISTANCIA' ? this.distancia.value : this.tempo.value;
    }

    private setEmbarquesMap(embarques: PercursoEmbarqueState[]) {
        embarques.forEach(emb => {
            let percursos: Percurso[] = this.embarquesMap.get(emb.pontoEmbarque.cod);

            if (!percursos) {
                percursos = [];
                this.embarquesMap.set(emb.pontoEmbarque.cod, percursos);
            }

            percursos.push(emb.percurso);
        });
    }

}

export interface AlertaConfirmado {
    type: 'TEMPO' | 'DISTANCIA';
    value: number
}

class AlertaInput {

    private _value: number;

    constructor(value: number, public min: number, public max: number) {
        this.value = value;
    }

    get value(): number {
        return this._value;
    }

    set value(val: number) {
        if (val >= this.min && val <= this.max) {
            this._value = val;
        }
    }

}
