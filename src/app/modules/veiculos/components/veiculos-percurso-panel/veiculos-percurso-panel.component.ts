import { Component, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { VeiculoPercurso, OperacaoPercurso } from '../../veiculos-state.service';
import { ShapeColor } from 'src/app/shared/models/bus-feature-shape';

@Component({
    selector: 'veiculos-percurso-panel',
    templateUrl: './veiculos-percurso-panel.component.html',
    styleUrls: ['./veiculos-percurso-panel.component.scss']
})
export class VeiculosPercursoPanelComponent implements OnChanges {

    @Input()
    public percurso: OperacaoPercurso;

    public veiculos: Veiculo[] = [];
    
    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.percurso) {
            const percursoChange: SimpleChange = changes.percurso;

            if (percursoChange.currentValue) {
                this.veiculos = (percursoChange.currentValue as OperacaoPercurso)
                    .veiculos.map(veiculo => new Veiculo(veiculo));
            } else if (this.veiculos.length > 0) {
                this.veiculos = [];
            }
        }
    }

    onVeiculoSelecionado(veiculo: Veiculo) {

    }

}


class Veiculo {
    numero: string;
    operadora: string;
    data: Date;
    color: ShapeColor;

    constructor(public veiculo: VeiculoPercurso) {
        this.numero = veiculo.veiculo.instante.veiculo.numero;
        this.data = new Date(veiculo.veiculo.instante.instante.data);
        this.operadora = veiculo.veiculo.instante.veiculo.operadora;
        this.color = veiculo.color;
    }
}
