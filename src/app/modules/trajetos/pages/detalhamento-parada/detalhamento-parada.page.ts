import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { flatMap, map, filter, first, shareReplay } from 'rxjs/operators';
import { throwError, of, Observable } from 'rxjs';
import { PercursoService } from 'src/app/shared/services/percurso.service';
import { Percurso } from 'src/app/shared/models/percurso';
import { Linha } from 'src/app/shared/models/linha';

@Component({
    templateUrl: './detalhamento-parada.page.html',
    styleUrls: ['./detalhamento-parada.page.scss'],
})
export class DetalhamentoParadaPage implements OnInit {

    public codParada$: Observable<string>;
    public percursos$: Observable<Percurso[]>;
    public linhas$: Observable<Linha[]>;

    constructor(private route: ActivatedRoute, private router: Router, private percursoService: PercursoService) {}

    ngOnInit() {
        this.codParada$ = this.route.paramMap
            .pipe(first())
            .pipe(flatMap(map => map.has('codigoParada') 
                ? of(map.get('codigoParada')) 
                : throwError('Ponto de embarque não identificado')));

        this.percursos$ = this.codParada$
            .pipe(flatMap(cod => this.percursoService.obterPercursosByParadaCod(cod)))
            .pipe(shareReplay({refCount: true, bufferSize: 1}));

        this.linhas$ = this.percursos$
            .pipe(map(percursos => {
                const linhaMap: Map<number, Linha> = new Map();
                percursos.forEach(percurso => linhaMap.set(percurso.linha.id, percurso.linha));
                return Array.from(linhaMap.values());
            })).pipe(shareReplay({refCount: true, bufferSize: 1}));
    }

    onLinhaSelecionada(linha: Linha) {
        this.percursos$
            .pipe(map(percursos => percursos.filter(p => p.linha.id == linha.id)))
            .pipe(filter(percursos => percursos.length > 0))
            .pipe(map(percursos => percursos.length == 1 
                ? percursos[0] 
                : percursos.sort((p1, p2) => p1.sentido.localeCompare(p2.sentido))[0]
            )).subscribe(percurso => {
                this.router.navigate(['/trajetos/linha', percurso.id]);
            });
    }

}