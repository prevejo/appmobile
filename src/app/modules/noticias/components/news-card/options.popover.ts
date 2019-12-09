import { Component } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
    selector: 'news-options-popover',
    templateUrl: './options.popover.html'
})
export class OptionsPopoverComponent {

    model: OptionsModel;

    constructor(params: NavParams) {
        this.model = params.get('model');
    }

}

export interface OptionsModel {

    popover: HTMLIonPopoverElement | null,
    detalhar(event): void;
    remover(event): void;

}
