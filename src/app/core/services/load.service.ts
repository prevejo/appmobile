import { Injectable } from '@angular/core';
import { Observable, Subscription, Subject, of, concat } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LoadService {

    private loadState: LoadState = new LoadStateImpl();
    private loadClient: LoadClient;
    private _isLoading: boolean = false;

    constructor() {
        this.loadClient = this.loadState.subscribe(() => {
            this._isLoading = true;
        }, () => {
            this._isLoading = false;
        });
    }

    state(): LoadState {
        return this.loadState;
    }

    isLoading(): boolean {
        return this._isLoading;
    }

}

export interface LoadState {
    subscribe(startListener: () => void, completeListener: () => void): LoadClient;
    addLoad(obs: Observable<any>): void;
}

class LoadStateImpl implements LoadState {

    private sub: Subject<Observable<any>> = new Subject();
    private currentObs: Observable<any> = of(1);
    private currentSub: Subscription;

    private _loading: boolean = false;
    private startSub: Subject<any> = new Subject();
    private completeSub: Subject<any> = new Subject();
    
    constructor() {
        this.sub.subscribe(obs => {
            this.processLoad(obs);
        });
    }

    subscribe(startListener: () => void, completeListener: () => void): LoadClient {
        return new LoadClientImpl(
            this.startSub.subscribe(startListener),
            this.completeSub.subscribe(completeListener)
        );
    }

    addLoad(obs: Observable<any>) {
        if (!this._loading) {
            this._loading = true;
            this.startSub.next();
        }

        this.sub.next(obs);
    }

    private processLoad(obs: Observable<any>) {
        if (this.currentSub != undefined) {
            this.currentSub.unsubscribe();
        }

        this.currentObs = concat(this.currentObs, obs);
        this.currentSub = this.currentObs.subscribe(undefined, undefined, () => this.onComplete());
    }

    private onComplete() {
        this._loading = false;
        this.completeSub.next();
    }
}


export interface LoadClient {
    unsubscribe(): void;
}

class LoadClientImpl implements LoadClient {
    constructor(private startSubscription: Subscription, private completeSubscription: Subscription) {}
    
    unsubscribe() {
        this.startSubscription.unsubscribe();
        this.completeSubscription.unsubscribe();
    }
}