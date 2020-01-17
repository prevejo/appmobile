import { Component, OnInit, Input } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Percurso } from 'src/app/shared/models/percurso';
import { PercursoList } from '../../veiculos-state.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'seletor-percurso-panel',
    templateUrl: './seletor-percurso-panel.component.html',
    styleUrls: ['./seletor-percurso-panel.component.scss']
})
export class SeletorPercursoPanelComponent implements OnInit {

    public searchBarValue: string;
    public percursosSubject: Subject<Percurso[]> = new Subject();
    public percursos$: Observable<Percurso[]>;

    @Input()
    public currentList: PercursoList;

    constructor() {}

    ngOnInit() {
        this.percursos$ = this.percursosSubject.pipe(map(percursos => this.filterPercursos(percursos)));
    }

    onPercursoSelecionado(percurso: Percurso) {
        this.currentList.add(percurso);
        this.searchBarValue = '';
        this.percursosSubject.next([]);
    }

    private filterPercursos(percursos: Percurso[]): Percurso[] {
        return percursos
            .filter(perc => !this.currentList.has(perc))
            .sort((percA, percB) => percA.linha.numero.localeCompare(percB.linha.numero))
    }

}
