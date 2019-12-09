import { Component, OnInit } from '@angular/core';
import { InboxStateService, InboxState, NoticiaState, InboxNotification } from '../../inbox-state.service';
import { Observable, Subject, ReplaySubject } from 'rxjs';
import { flatMap, first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Slug } from 'src/app/shared/util/slug';
import { NotificationBarService } from 'src/app/core/services/notification-bar.service';

@Component({
    templateUrl: './noticias.page.html',
    styleUrls: ['./noticias.page.scss']
})
export class NoticiasPage implements OnInit {

    inbox$: Subject<InboxState> = new ReplaySubject(1);
    noticias$: Observable<NoticiaState[]>;
    total: number = null;


    constructor(
        private inboxService: InboxStateService,
        private router: Router,
        private notbarService: NotificationBarService) {}

    ngOnInit() {
        this.noticias$ = this.inbox$.pipe(flatMap(inbox => inbox.open()));
        this.notbarService.notifications.filter(n => n instanceof InboxNotification).forEach(n => this.notbarService.unregister(n));
    }

    ionViewWillEnter() {
        this.inboxService.retriveState()
            .pipe(first())
            .subscribe(state => {
                this.inbox$.next(state);
            });
    }

    ionViewDidEnter() {
        this.registerState();
    }

    onNoticiaSelecionada(news: NoticiaState) {
        let id = String(news.noticia.id);

        if (id.startsWith('-')) {
            id = id.replace('-', 'N');
        }

        this.router.navigate(['/noticias/detalhe', Slug.slugify(id + ' ' + news.noticia.titulo)]);
        news.visited = true;
        this.registerState();
    }

    onRemocaoSolicitada(news: NoticiaState) {
        this.inbox$.pipe(first()).subscribe(state => {
            state.remove(news.noticia);
        });
    }

    private registerState() {
        this.inbox$.pipe(first()).subscribe(inbox => {
            this.inboxService.registerState(inbox);
            this.total = inbox.unvisitedTotal();
            if (this.total === 0) {
                this.total = null;
            }
        });
    }

}
