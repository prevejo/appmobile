import { Component, EventEmitter, Output, Input } from '@angular/core';
import { TopicoAtualizado } from '../../topico.service';

@Component({
    selector: 'topico-card',
    templateUrl: './topico-card.component.html',
    styleUrls: ['./topico-card.component.scss']
})
export class TopicoCardComponent {

    @Output()
    public clickEvent: EventEmitter<any> = new EventEmitter();

    @Input()
    public topico: TopicoAtualizado;

}
