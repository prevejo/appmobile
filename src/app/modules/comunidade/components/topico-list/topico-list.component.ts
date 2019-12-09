import { Component, Input, EventEmitter, Output } from '@angular/core';
import { TopicoAtualizado } from '../../topico.service';

@Component({
    selector: 'topico-list',
    templateUrl: './topico-list.component.html',
    styleUrls: ['./topico-list.component.scss']
})
export class TopicoListComponent {

    @Output()
    public clickEvent: EventEmitter<TopicoAtualizado> = new EventEmitter();

    @Input()
    public topicos: TopicoAtualizado[];

}
