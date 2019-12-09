import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NoticiaState } from '../../inbox-state.service';

@Component({
    selector: 'news-list',
    templateUrl: './news-list.component.html',
    styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent {

    @Input()
    public news: NoticiaState[];

    @Output()
    public clickEvent: EventEmitter<NoticiaState> = new EventEmitter();
    @Output()
    public removeEvent: EventEmitter<NoticiaState> = new EventEmitter();

}
