import { Component, Input } from '@angular/core';
import { Comentario } from '../../comentario.service';

@Component({
    selector: 'comentario-list',
    templateUrl: './comentario-list.component.html',
    styleUrls: ['./comentario-list.component.scss']
})
export class ComentarioListComponent {

    @Input()
    public comentarios: Comentario[];
    @Input()
    public expandable: boolean;
    private expanded: Comentario[] = [];

    onClickComentario(comentario: Comentario) {
        if (!this.expandable) {
            return;
        }

        const index = this.expanded.indexOf(comentario);

        if (index == -1) {
            this.expanded.push(comentario);
        } else {
            this.expanded.splice(index, 1);
        }
    }

    isExpanded(comentario: Comentario) {
        return this.expanded.indexOf(comentario) != -1;
    }

}
