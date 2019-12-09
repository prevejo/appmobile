import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Percurso } from 'src/app/shared/models/percurso';
import { Parada } from 'src/app/shared/models/parada';
import { TrechoPercursoCollection } from 'src/app/shared/models/trecho-percurso-collection';

@Component({
    selector: 'trajeto-panel',
    templateUrl: './trajeto-panel.component.html',
    styleUrls: ['./trajeto-panel.component.scss']
})
export class TrajetoPanelComponent implements OnInit {

    @Input()
    public trechos: TrechoPercursoCollection[];

    public percursos: PercursoView[];
    public pontos: PontoView[];

    @Output()
    public onParadaSelected: EventEmitter<{type: 'detail' | 'focus', parada: Parada}> = new EventEmitter();

    @Output()
    public onPercursoSelected: EventEmitter<{type: 'detail' | 'focus', percurso: Percurso}> = new EventEmitter();

    @Output()
    public preverEmbarqueClick: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
        this.updatePanel();
    }

    changeTrecho(trecho: TrechoPercursoCollection) {
        trecho.trocarPercurso();
        this.updatePanel();
    }

    private updatePanel() {
        this.percursos = this.trechos.map(trecho => {
            return {
                trecho: trecho,
                percurso: trecho.percursoSelecionado.percurso,
                color: trecho.position.getColor(),
                canBeChanged: trecho.percursos.length > 1
            } as PercursoView;
        });

        this.pontos = this.trechos
            .map(trecho => {
                return [
                    {
                        parada: trecho.percursoSelecionado.embarques[0],
                        color: trecho.position.getColor()
                    },{
                        parada: trecho.percursoSelecionado.desembarques[0],
                        color: trecho.position.getColor()
                    }
                ] as PontoView[];
            })
            .reduce((prev, next) => prev.concat(next), []);
    }

}

interface PontoView {
    parada: Parada;
    color: string;
}

interface PercursoView {
    percurso: Percurso;
    color: string;
}
