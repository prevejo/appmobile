import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { VeiculosList } from '../../veiculo-state.service';

@Component({
    selector: 'veiculos-panel',
    templateUrl: './veiculos-panel.component.html',
    styleUrls: ['./veiculos-panel.component.scss']
})
export class VeiculosPanelComponent {

    @Input()
    public veiculosList$: Observable<VeiculosList>;
    @Output()
    public btnVoltarClick: EventEmitter<any> = new EventEmitter();

}
