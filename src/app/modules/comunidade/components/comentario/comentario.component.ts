import { Component, Input } from '@angular/core';
import { Comentario } from '../../comentario.service';

@Component({
    selector: 'comentario',
    templateUrl: './comentario.component.html',
    styleUrls: ['./comentario.component.scss']
})
export class ComentarioComponent {

    @Input()
    public comentario: Comentario;

}
