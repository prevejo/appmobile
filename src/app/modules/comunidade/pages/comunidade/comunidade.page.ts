import { Component } from '@angular/core';
import { TopicoService, TopicoAtualizado } from '../../topico.service';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    templateUrl: './comunidade.page.html',
    styleUrls: ['./comunidade.page.scss']
})
export class ComunidadePage {

    topicos$: Subject<TopicoAtualizado[]> = new ReplaySubject(1);
    private loadSubscription: Subscription = null;

    constructor(private topicoService: TopicoService, private router: Router) {}

    ionViewWillEnter() {
        this.loadSubscription = this.topicoService.obterTopicosAtualizados()
            .subscribe(topicos => {
                this.topicos$.next(topicos);
            });
    }

    ionViewWillLeave() {
        if (this.loadSubscription != null) {
            this.loadSubscription.unsubscribe();
        }
    }

    onTopicoSelecionado(topico: TopicoAtualizado) {
        this.router.navigate(['/comunidade/topico', topico.topico.id]);
    }

}
