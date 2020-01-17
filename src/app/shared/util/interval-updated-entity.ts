import { Observable, Subscription, of, concat, interval } from "rxjs";

export abstract class IntervalUpdatedEntity {

    private interval$: Observable<number>;
    private _intervalSub: Subscription = null;
    private _currentUpdateSub: Subscription = null;
    private subscriptions: Set<Subscription> = new Set();
    private _running: boolean = false;

    constructor(intervalTime: number) {
        this.interval$ = concat(of(1), interval(intervalTime));
    }

    protected abstract update(): Subscription;

    restartUpdate(): void {
        this.stopUpdate();
        this.startUpdate();
    }

    startUpdate(): void {
        this._intervalSub = this.interval$.subscribe(() => {
            this._currentUpdateSub = this.update();
        });
        this._running = true;
    }

    stopUpdate(): void {
        if (this._intervalSub != null) {
            this._intervalSub.unsubscribe();
            this._running = false;
        }

        if (this._currentUpdateSub != null) {
            this._currentUpdateSub.unsubscribe();
        }
    }

    isRunning(): boolean {
        return this._running;
    }

    protected receiveSubscription(subs: Subscription): Subscription {
        if (this.subscriptions.size === 0) {
            this.startUpdate();
        }

        this.subscriptions.add(subs);

        subs.add(() => {
            this.subscriptions.delete(subs);
            if (this.subscriptions.size === 0) {
                this.stopUpdate();
            }
        });
        return subs;
    }

}
