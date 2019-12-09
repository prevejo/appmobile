import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { VeiculosList } from '../../veiculo-state.service';
import { InstanteVeiculo } from 'src/app/shared/models/instante-veiculo';
import { Subscription, interval, concat, of } from 'rxjs';

@Component({
    selector: 'veiculos-list',
    templateUrl: './veiculos-list.component.html',
    styleUrls: ['./veiculos-list.component.scss']
})
export class VeiculosListComponent implements OnDestroy, OnInit {

    @Input()
    public veiculosList: VeiculosList;

    veiculos: Veiculo[];

    private intervalSubscription: Subscription;

    ngOnInit() {
        this.intervalSubscription = concat(of(1), interval(5000)).subscribe(() => {
            this.veiculos = this.veiculosList.veiculos.map(v => new Veiculo(v));
            this.veiculos.sort((v1, v2) => v1.numero.localeCompare(v2.numero));
        });
    }

    ngOnDestroy() {
        this.intervalSubscription.unsubscribe();
    }

}

class Veiculo {
    numero: string;
    operadora: string;
    data: Date;

    constructor(public instante: InstanteVeiculo) {
        this.numero = instante.veiculo.numero;
        this.data = new Date(instante.instante.data);
        this.operadora = instante.veiculo.operadora;
    }
}
