import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Trajeto } from '../../../../shared/models/trajeto';

@Component({
    selector: 'item-trajeto',
    templateUrl: './item-trajeto.component.html',
    styleUrls: ['./item-trajeto.component.scss']
})
export class ItemTrajetoComponent implements OnInit {

    @Input()
    public trajeto: Trajeto;

    @Output()
    public onItemSelected: EventEmitter<Trajeto> = new EventEmitter();

    public pontos: Array<any>;
    public linhas: Array<string>;

    ngOnInit() {
        this.pontos = new Array(this.trajeto.trechos.length + 1);
        this.linhas = this.trajeto.trechos.map(trecho => trecho.percursos[0].percurso.linha.numero);
    }
    
}