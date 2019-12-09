import { Component, OnInit, Injector } from '@angular/core';
import { Subject, BehaviorSubject, forkJoin, Subscription } from 'rxjs';
import { PesquisaStateService, PesquisaState } from '../../pesquisa-state.service';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
    templateUrl: './pesquisa.page.html',
    styleUrls: ['./pesquisa.page.scss'],
})
export class PesquisaPage implements OnInit {

    public percursos: any;
    public resultListShowControl: Subject<boolean> = new BehaviorSubject<boolean>(true);
    public locationRequestControl: Subject<any> = new Subject();
    public pesquisaState: PesquisaState;
    private _loadSubscription: Subscription = null;

    constructor(pesquisaStateService: PesquisaStateService, private router: Router, private injector: Injector) {
        this.pesquisaState = pesquisaStateService.instanceState();
    }

    ngOnInit() {
        this._loadSubscription = this.pesquisaState.showParadas();
    }

    onMapMoves(event) {
        this.resultListShowControl.next(false);
    }

    onClickBtnPesquisar() {
        forkJoin([
            this.pesquisaState.routePanelState.getStartLocation().toMap(),
            this.pesquisaState.routePanelState.getEndLocation().toMap()
        ]).subscribe(startAndEnd => {
            const params = this.mergeObjects(
                this.buildQueryParams(startAndEnd[0], 'start'),
                this.buildQueryParams(startAndEnd[1], 'end')
            );

            this.router.navigate(['/trajetos/lista'], { queryParams: params });
        }, err => {
            this.injector.get(NotificationService).showError('Não foi possível pesquisar: ' + err);
        });
    }

    private buildQueryParams(params: {[key: string]: string}, position: 'start' | 'end'): {[key: string]: string} {
        const obj: {[key: string]: string} = {};
        Object.keys(params).forEach(key => obj[position + '_' + key] = params[key]);
        return obj;
    }

    private mergeObjects(obj1: {[key: string]: string}, obj2: {[key: string]: string}): {[key: string]: string} {
        const obj: {[key: string]: string} = {};
        [obj1, obj2].forEach(o => Object.keys(o).forEach(key => obj[key] = o[key]));
        return obj;
    }

    ionViewWillLeave() {
        if (this._loadSubscription != null) {
            this._loadSubscription.unsubscribe();
        }
    }

}
