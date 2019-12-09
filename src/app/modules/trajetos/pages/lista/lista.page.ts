import { Component, OnInit } from '@angular/core';
import { Trajeto } from '../../../../shared/models/trajeto';
import { TrajetoStateService, TrajetoListState } from '../../trajeto-state-service';
import { Subscribable, forkJoin, Observable, Subscription } from 'rxjs';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { buildMap, RouteLocation } from 'src/app/shared/models/route-location';
import { first, flatMap, map, shareReplay } from 'rxjs/operators';

@Component({
    templateUrl: './lista.page.html',
    styleUrls: ['./lista.page.scss'],
})
export class ListaPage implements OnInit {

    private state: Observable<TrajetoListState>;
    public trajetos$: Observable<Trajeto[]>;

    constructor(private trajetoStateService: TrajetoStateService, private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {
        this.state = this.route.queryParams
            .pipe(first())
            .pipe(flatMap(params => forkJoin(this.parseRouteLocation('start', params), this.parseRouteLocation('end', params))))
            .pipe(map((routes: RouteLocation[]) => this.trajetoStateService.instanceListState(routes[0], routes[1])))
            .pipe(shareReplay());

        this.trajetos$ = this.state
            .pipe(flatMap(state => state.trajetos()));
    }

    onTrajetoSelecionado(trajeto: Trajeto) {
        this.state.subscribe(state => {
            state.setTrajetoSelecionado(trajeto);
            this.router.navigate(['/trajetos/trajeto']);
        });
    }

    private parseRouteLocation(position: 'start' | 'end', params: Params): Subscribable<RouteLocation> {
        const routeParams = Object.keys(params).filter(key => key.startsWith(position + '_')).map(key => {
            return {
                key: key.replace(position + '_', ''),
                value: params[key]
            };
        }).reduce((prev, next) => {
            prev[next.key] = next.value;
            return prev;
        }, {});

        return buildMap[routeParams['type']](routeParams);
    }

}