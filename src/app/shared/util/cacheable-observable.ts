import { Observable, Subscriber } from "rxjs";
import { shareReplay } from 'rxjs/operators';

export class CacheableObservable<T> extends Observable<T> {

    public constructor(private observable: Observable<T>) {
        super(sub => this.onObserve(sub));
        this.observable = this.observable.pipe(
            shareReplay({
                refCount: true,
                bufferSize: 1
            })
        );
    }

    private onObserve(subscriber: Subscriber<T>) {
        let subscription = this.observable.subscribe(obj => {
            subscriber.next(obj);
        }, err => {
            subscriber.error(err);
        }, () => {
            subscriber.complete();
        });

        subscriber.add(() => {
            subscription.unsubscribe();
        });
    }

}