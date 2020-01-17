import { Component } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
    selector: 'percurso-options-popover',
    templateUrl: './options.popover.html'
})
export class PercursoOptionsPopoverComponent {

    model: PercursoOptionsModel;

    constructor(params: NavParams) {
        this.model = params.get('model');
    }

}

export interface PercursoOptionsModel {

    popover: HTMLIonPopoverElement | null,
    detalhar(event): void;
    detalharVeiculos(event): void;
    remover(event): void;

}
