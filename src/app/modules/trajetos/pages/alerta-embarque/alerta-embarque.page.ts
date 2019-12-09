import { Component, OnInit } from '@angular/core';
import { AlarmeEmbarqueService, Alarme, buildMetricaAlarme } from '../../alarme-embarque.service';
import { EmbarqueState } from '../../embarque-state.service';
import { AlertaConfirmado } from '../../components/alerta-form/alerta-form.component';

@Component({
    templateUrl: './alerta-embarque.page.html',
    styleUrls: ['./alerta-embarque.page.scss']
})
export class AlertaEmbarquePage implements OnInit {

    embarqueStateASerDefinido: EmbarqueState = null;
    currentAlarme: Alarme = null;

    constructor(private alarmeService: AlarmeEmbarqueService) {}

    ngOnInit() {
        this.setCurrentAlarme(this.alarmeService.currentAlarme);

        this.alarmeService.consumeEmbarquesADefinir().subscribe(embarqueState => {
            this.embarqueStateASerDefinido = embarqueState;

            if (this.currentAlarme != null) {
                this.alarmeService.interromperAlarme();
                this.currentAlarme = null;
            }
        });
    }

    onAlertaConfirmado(event: AlertaConfirmado) {
        this.setCurrentAlarme(this.alarmeService.definir(
            this.embarqueStateASerDefinido,
            buildMetricaAlarme(event.type, event.value)
        ));
        this.embarqueStateASerDefinido = null;
    }

    onClickBtnInterromperAlarme() {
        this.alarmeService.interromperAlarme();
        this.embarqueStateASerDefinido = this.currentAlarme.embarqueState;
        this.setCurrentAlarme(null);
    }

    isAnyAlarmeDefinido(): boolean {
        return this.currentAlarme != null;
    }

    isAnyAlertaAserDefinido(): boolean {
        return this.embarqueStateASerDefinido != null;
    }

    isAnyAlarmeAtivo(): boolean {
        return this.currentAlarme != null && this.currentAlarme.isActive();
    }

    private setCurrentAlarme(alarme: Alarme) {
        this.currentAlarme = alarme;
    }

}
