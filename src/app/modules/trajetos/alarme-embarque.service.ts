import { Injectable } from '@angular/core';
import { EmbarqueState, Embarque, ColorfulEmbarque } from './embarque-state.service';
import { of, EMPTY, Observable, Subject, Subscription, ReplaySubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { NotificationBarService, NotificationIcon } from 'src/app/core/services/notification-bar.service';
import { Router } from '@angular/router';

@Injectable()
export class AlarmeEmbarqueService {

    private embarquesAdefinir: EmbarqueState = null;

    currentAlarme: Alarme = null;

    constructor(private notifcationBarService: NotificationBarService, private router: Router) {}

    consumeEmbarquesADefinir(): Observable<EmbarqueState> {
        const obs: Observable<EmbarqueState> = this.embarquesAdefinir != null
            ? of(this.embarquesAdefinir) : EMPTY;

        return obs.pipe(tap(() => this.setEmbarquesAdefinir(null)));
    }

    setEmbarquesAdefinir(embarquesAdefinir: EmbarqueState) {
        this.embarquesAdefinir = embarquesAdefinir;
    }

    definir(embarqueState: EmbarqueState, metrica: Metrica): Alarme {
        const notification = new AlarmeNotification(
            () => this.router.navigate(['/trajetos/alerta']),
            this.notifcationBarService
        );

        this.currentAlarme = new AlarmeImpl(embarqueState, notification, metrica );
        this.currentAlarme.start();

        return this.currentAlarme;
    }

    interromperAlarme() {
        if (this.currentAlarme) {
            this.currentAlarme.stop();
            this.currentAlarme = null;
        }
    }

}

class AlarmeNotification implements NotificationIcon {

    iconName = 'notifications';
    private hightLigthing: boolean = false;

    constructor(private callback: () => void, private notService: NotificationBarService) {}

    clickCallback() {
        this.callback();
    }

    isHightLigthing(): boolean {
        return this.hightLigthing;
    }

    setHightLigthing(hightLigthing: boolean) {
        this.hightLigthing = hightLigthing;
    }

    register() {
        this.notService.register(this);
    }

    unregister() {
        this.notService.unregister(this);
    }

}

export interface Alarme {

    embarqueState: EmbarqueState;
    notification: AlarmeNotification;
    alarmSubject: Subject<ColorfulEmbarque[]>;
    metrica: Metrica;
    start(): Observable<ColorfulEmbarque[]>;
    stop(): void;
    isActive(): boolean;

}

class AlarmeImpl implements Alarme {

    alarmSubject: Subject<ColorfulEmbarque[]> = new ReplaySubject(1);
    private _updateSubscription: Subscription = null;
    private _embarquesSubscription: Subscription = null;

    constructor(
        public embarqueState: EmbarqueState,
        public notification: AlarmeNotification,
        public metrica: Metrica) {}

    start(): Observable<ColorfulEmbarque[]> {
        this.notification.register();

        this._embarquesSubscription = this.embarqueState.embarqueCollection
            .embarquesObservable()
            .subscribe(embarques => {
                this.onEmbarquesUpdate(embarques);
            });

        this._updateSubscription = this.embarqueState.requestIntervalUpdate();

        return this.alarmSubject;
    }

    stop() {
        if (this._updateSubscription != null) {
            this._updateSubscription.unsubscribe();
        }
        if (this._embarquesSubscription != null) {
            this._embarquesSubscription.unsubscribe();
        }
        this.notification.unregister();
    }

    isActive(): boolean {
        return this._updateSubscription != null && !this._updateSubscription.closed;
    }

    private onEmbarquesUpdate(embarques: ColorfulEmbarque[]) {
        const eminentes: Embarque[] = this.metrica.filter(embarques.map(emb => emb.embarque));

        embarques = embarques.filter(emb => eminentes.indexOf(emb.embarque) != -1);

        this.notification.setHightLigthing(embarques.length > 0);

        this.alarmSubject.next(embarques);
    }

}

export interface Metrica {

    type: string;
    value: number;
    desc: string;
    filter(embarques: Embarque[]): Embarque[];
    min(embarques: Embarque[]): Embarque;
    valueFrom(embarque: Embarque): number;

}

class ByDistancia implements Metrica {
    type: string = 'DISTANCIA';
    desc: string = 'km';

    constructor(public value: number) {}

    filter(embarques: Embarque[]): Embarque[] {
        return embarques.filter(emb => emb.tempoRestante <= this.value);
    }

    min(embarques: Embarque[]): Embarque {
        embarques.sort((emb1, emb2) => {
            return emb1.distanciaRestante < emb2.distanciaRestante ? -1
                : emb1.distanciaRestante > emb2.distanciaRestante ? 1 : 0;
        });

        return embarques.length ? embarques[0] : null;
    }

    valueFrom(embarque: Embarque): number {
        return embarque.distanciaRestante;
    }

}

class ByTempo implements Metrica {
    type: string = 'TEMPO';
    desc: string = 'min';

    constructor(public value: number) {}

    filter(embarques: Embarque[]): Embarque[] {
        return embarques.filter(emb => emb.tempoRestante <= this.value);
    }

    min(embarques: Embarque[]): Embarque {
        embarques.sort((emb1, emb2) => {
            return emb1.tempoRestante < emb2.tempoRestante ? -1
                : emb1.tempoRestante > emb2.tempoRestante ? 1 : 0;
        });

        return embarques.length ? embarques[0] : null;
    }

    valueFrom(embarque: Embarque): number {
        return embarque.tempoRestante;
    }

}

export function buildMetricaAlarme(type: 'DISTANCIA' | 'TEMPO', value: number): Metrica {
    return type == 'DISTANCIA'
            ? new ByDistancia(value)
        : type == 'TEMPO'
            ? new ByTempo(value)
        : null;
};
