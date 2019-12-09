import { Component, Input, EventEmitter, Output } from '@angular/core';
import { NoticiaState } from '../../inbox-state.service';
import { PopoverController } from '@ionic/angular';
import { OptionsPopoverComponent, OptionsModel } from './options.popover';

@Component({
    selector: 'news-card',
    templateUrl: './news-card.component.html',
    styleUrls: ['./news-card.component.scss']
})
export class NewsCardComponent {

    @Input()
    public news: NoticiaState;

    @Output()
    public clickEvent: EventEmitter<NoticiaState> = new EventEmitter();
    @Output()
    public removeEvent: EventEmitter<NoticiaState> = new EventEmitter();

    constructor(private popoverCtrl: PopoverController) {}

    onClickOptions(event) {
        event.preventDefault();
        event.stopPropagation();

        const model = {
            detalhar: (evt) => this.clickEvent.emit(this.news),
            remover: (evt) => this.removeEvent.emit(this.news)
        } as OptionsModel;

        this.popoverCtrl.create({
            component: OptionsPopoverComponent,
            event: event,
            componentProps: { model: model }
        }).then(popover => {
            model.popover = popover;
            popover.present();
        });
    }

}
