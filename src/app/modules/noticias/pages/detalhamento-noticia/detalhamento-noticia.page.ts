import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first, flatMap, shareReplay } from 'rxjs/operators';
import { of, throwError, Observable } from 'rxjs';
import { NoticiasService, Noticia } from '../../noticias.service';
import { NavController } from '@ionic/angular';
import { InboxStateService } from '../../inbox-state.service';

@Component({
    templateUrl: './detalhamento-noticia.page.html',
    styleUrls: ['./detalhamento-noticia.page.scss']
})
export class DetalhamentoNoticiaPage implements OnInit {

    noticia$: Observable<Noticia>;

    constructor(
        private route: ActivatedRoute,
        private noticiasService: NoticiasService,
        private inboxService: InboxStateService,
        private navCtrl: NavController) {}

    ngOnInit() {
        this.noticia$ = this.route.paramMap
            .pipe(first())
            .pipe(flatMap(params => params.has('slug') && !isNaN(parseInt(params.get('slug').split('-')[0].replace('n', '-')))
                ? of(parseInt(params.get('slug').split('-')[0].replace('n', '-')))
                : throwError('Artigo não identificado')))
            .pipe(flatMap(id => this.noticiasService.obterNoticia(id)))
            .pipe(shareReplay({refCount: true, bufferSize: 1}));

    }

    onClickBtnRemover() {
        this.noticia$.pipe(first())
            .subscribe(noticia => {
                this.inboxService.retriveState().subscribe(state => {
                    state.remove(noticia);
                });
            });

        this.navCtrl.back();
    }

}
