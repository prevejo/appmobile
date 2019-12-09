import { Component, OnInit } from '@angular/core';
import { TopicoAtualizado, TopicoService, Topico } from '../../topico.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError, Subject, Subscription, ReplaySubject } from 'rxjs';
import { first, flatMap, shareReplay, map, debounceTime, finalize, takeUntil } from 'rxjs/operators';
import { NovoComentario, ComentarioService, Comentario, ComentarioProvider } from '../../comentario.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
    templateUrl: './topico.page.html',
    styleUrls: ['./topico.page.scss']
})
export class TopicoPage implements OnInit {

    topico$: Observable<Topico>;
    topicoAtualizado$: Observable<TopicoAtualizado>;
    model$: Observable<TopicoModel>;
    _model: TopicoModel = null;
    private pageDismiss: Subject<void> = new Subject();
    comentarioFormDisabled = false;
    comentarioAdicionado: Comentario = null;

    constructor(
        private route: ActivatedRoute,
        private topicoService: TopicoService,
        private comentarioService: ComentarioService,
        private notService: NotificationService) {}

    ngOnInit() {
        this.topicoAtualizado$ = this.route.paramMap
            .pipe(first())
            .pipe(flatMap(params => params.has('topicoId')
                ? of(parseInt(params.get('topicoId')))
                : throwError('Tópico não identificado')))
            .pipe(flatMap(id => this.topicoService.obterTopicoAtualizado(id)))
            .pipe(takeUntil(this.pageDismiss))
            .pipe(shareReplay({refCount: true, bufferSize: 1}));

        this.topico$ = this.topicoAtualizado$.pipe(map(ta => ta.topico));

        this.model$ = this.topicoAtualizado$
            .pipe(map(topico => new TopicoModel(topico.topico, this.comentarioService)))
            .pipe(shareReplay({refCount: true, bufferSize: 1}));

        this.model$
            .pipe(takeUntil(this.pageDismiss))
            .subscribe(model => this._model = model);
    }

    onComentarioConfirmado(novoComentario: NovoComentario) {
        this.comentarioFormDisabled = true;
        this.comentarioService.registrar(novoComentario)
            .pipe(takeUntil(this.pageDismiss))
            .pipe(finalize(() => this.comentarioFormDisabled = false))
            .subscribe(comentario => {
                this.notService.showInfo('Comentário adicionado');

                this.onComentarioRegistrado(comentario);
            });
    }

    private onComentarioRegistrado(comentario: Comentario) {
        this.comentarioAdicionado = comentario;
        if (this._model != null) {
            if (!this._model.searchValue) {
                this._model.loadMostRecents();
            }
        }
    }

    ionViewWillLeave() {
        this.pageDismiss.next();
        this.pageDismiss.complete();

        if (this._model != null) {
            this._model.cancelSubscriptions();
        }
    }

}

class TopicoModel {

    searchValue: string;
    loadIndicator = new Subject<boolean>();
    results$: Subject<Comentario[]> = new ReplaySubject(1);

    private filterString: Subject<string> = new Subject();
    private recentsSubscription: Subscription = null;
    private searchSubscription: Subscription = null;
    private MAX_SEARCH_RESULTS = 10;

    constructor(private topico: Topico, private provider: ComentarioProvider) {
        this.search('');
        this.filterString.pipe(debounceTime(250)).subscribe(searchValue => {
            this.search(searchValue);
        });
    }

    onInput(event: any) {
        const value = event.target.value;
        this.filterString.next(value);
    }

    loadMostRecents() {
        this.cancelSubscriptions();
        this.recentsSubscription = this.provider.mostRecents(this.topico)
            .subscribe(recents => this.results$.next(recents));
    }

    cancelSubscriptions() {
        [
            this.recentsSubscription,
            this.searchSubscription
        ].filter(s => s != null).forEach(s => s.unsubscribe());
    }

    private search(value: string) {
        if (value) {
            this.cancelSubscriptions();

            this.loadIndicator.next(true);
            this.searchSubscription = this.provider.search(this.topico, value, this.MAX_SEARCH_RESULTS)
                .pipe(finalize(() => this.loadIndicator.next(false)))
                .subscribe(comentarios => {
                    this.results$.next(comentarios);
                });
            this.loadIndicator.next(false);
        } else {
            this.loadMostRecents();
        }
    }

}
