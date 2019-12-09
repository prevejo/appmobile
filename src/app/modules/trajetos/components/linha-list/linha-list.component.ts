import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Linha } from 'src/app/shared/models/linha';

@Component({
    selector: 'linha-list',
    templateUrl: './linha-list.component.html',
    styleUrls: ['./linha-list.component.scss']
})
export class LinhaListComponent {

    @Input()
    public linhas: Linha[];

    @Output()
    public onLinhaSelecionada: EventEmitter<Linha> = new EventEmitter();

}