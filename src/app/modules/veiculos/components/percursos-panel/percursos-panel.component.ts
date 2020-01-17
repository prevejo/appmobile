import { Component, Input, EventEmitter, Output } from '@angular/core';
import { PercursoList, OperacaoPercurso } from '../../veiculos-state.service';
import { PercursoOptionsModel, PercursoOptionsPopoverComponent } from './options.popover';
import { PopoverController } from '@ionic/angular';

@Component({
    selector: 'percursos-panel',
    templateUrl: './percursos-panel.component.html',
    styleUrls: ['./percursos-panel.component.scss']
})
export class PercursosPanelComponent {

    @Output()
    public onClickBtnAdd: EventEmitter<any> = new EventEmitter();

    @Output()
    public onClickBtnRegistro: EventEmitter<any> = new EventEmitter();

    @Input()
    public currentList: PercursoList;

    @Output()
    public controlEvent: EventEmitter<PercursoControlEvent> = new EventEmitter();

    constructor(private popoverCtrl: PopoverController) {}

    onPercursoSelecionado(perc: OperacaoPercurso) {
        this.controlEvent.emit({
            type: 'selecionar',
            percurso: perc
        });
    }

    onClickOptions(event, perc: OperacaoPercurso) {
        event.preventDefault();
        event.stopPropagation();

        const model = {
            detalhar: (evt) => this.controlEvent.emit({
                type: 'detalhar',
                percurso: perc
            }),
            detalharVeiculos: (evt) => this.controlEvent.emit({
                type: 'detalhar_veiculos',
                percurso: perc
            }),
            remover: (evt) => this.controlEvent.emit({
                type: 'remover',
                percurso: perc
            })
        } as PercursoOptionsModel;

        this.popoverCtrl.create({
            component: PercursoOptionsPopoverComponent,
            event: event,
            componentProps: { model: model }
        }).then(popover => {
            model.popover = popover;
            popover.present();
        });
    }

}

export interface PercursoControlEvent {
    type: 'detalhar' | 'remover' | 'selecionar' | 'detalhar_veiculos',
    percurso: OperacaoPercurso
}