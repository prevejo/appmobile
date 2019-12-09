import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NovoComentario, Comentario } from '../../comentario.service';
import { Topico } from '../../topico.service';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
    selector: 'comentario-form',
    templateUrl: './comentario-form.component.html',
    styleUrls: ['./comentario-form.component.scss']
})
export class ComentarioFormComponent {

    @Input()
    public topico: Topico;

    @Input()
    public disabled: boolean;

    @Output()
    public confirmationEvent: EventEmitter<NovoComentario> = new EventEmitter();

    @Output()
    public comentarioAdicionadoChange: EventEmitter<Comentario> = new EventEmitter();
    private _comentarioAdicionado: Comentario;

    novoComentario: NovoComentario = {
        topicoId: null,
        assunto: '',
        comentario: ''
    };

    constructor(private notService: NotificationService) {}

    onClickBtnAdicionar(event) {
        if (this.novoComentario.assunto.length < 2 || this.novoComentario.assunto.length > 100) {
            this.notService.showError('Assunto deve ter tamanho entre 2 e 100');
            return;
        }

        if (this.novoComentario.comentario.length < 2 || this.novoComentario.assunto.length > 4000) {
            this.notService.showError('Comentário deve ter tamanho entre 2 e 4000');
            return;
        }

        this.novoComentario.topicoId = this.topico.id;
        this.confirmationEvent.emit(this.novoComentario);
    }

    onClickBtnNovo(event) {
        this.comentarioAdicionado = null;
        this.novoComentario.assunto = this.novoComentario.comentario = '';
    }

    @Input()
    get comentarioAdicionado(): Comentario {
        return this._comentarioAdicionado;
    }

    set comentarioAdicionado(comentario: Comentario) {
        this._comentarioAdicionado = comentario;
        this.comentarioAdicionadoChange.emit(comentario);
    }

}
