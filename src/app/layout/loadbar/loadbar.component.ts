import { Component, Input, OnChanges, SimpleChanges, SimpleChange, ElementRef, ViewChild } from '@angular/core';
import { timer, Subscription } from 'rxjs';

@Component({
    selector: 'loadbar',
    templateUrl: './loadbar.component.html',
    styleUrls: [ './loadbar.component.scss' ]
})
export class LoadBarComponent implements OnChanges {

    @Input()
    public loading: boolean;

    @ViewChild('bar', {static: false})
    private loadingBar: ElementRef;

    @ViewChild('container', {static: false})
    private container: ElementRef;

    private incTimeout: Subscription;
    private completeTimeout: Subscription;
    private started: boolean = false;
    private status: number = 0;

    private startSize: number = 0.02;


    ngOnChanges(changes: SimpleChanges) {
        if (changes.loading) {
            const loadChange: SimpleChange = changes.loading;

            loadChange.currentValue ? this.startLoad() : this.completeLoad();
        }
    }

    private startLoad() {
        if (this.completeTimeout) {
            this.completeTimeout.unsubscribe();
        }

        // do not continually broadcast the started event:
        if (this.started) {
            return;
        }

        this.started = true;

        this._set(this.startSize);

        if (this.container) {
            this.container.nativeElement.className = 'enabled';
        }
    }

    private completeLoad() {
        this._set(1);

        if (this.completeTimeout) {
            this.completeTimeout.unsubscribe();
        }

        // Attempt to aggregate any start/complete calls within 200ms:
        this.completeTimeout = timer(300).subscribe(() => {

            this.container.nativeElement.className = '';
            this.loadingBar.nativeElement.style.width = '';
            this.status = 0;
            this.started = false;
        });
    }

    /**
     * Set the loading bar's width to a certain percent.
     *
     * @param n any value between 0 and 1
     */
    private _set(n: number) {
        if (!this.started || !this.loadingBar) {
            return;
        }

        var pct = (n * 100) + '%';
        this.loadingBar.nativeElement.style.width = pct;
        this.status = n;

        // increment loadingbar to give the illusion that there is always
        // progress but make sure to cancel the previous timeouts so we don't
        // have multiple incs running at the same time.
        if (this.incTimeout) {
            this.incTimeout.unsubscribe();
        }

        this.incTimeout = timer(250).subscribe(() => {
            this._inc();
        });
    }

    /**
     * Increments the loading bar by a random amount
     * but slows down as it progresses
     */
    private _inc() {
        if (this._status() >= 1) {
            return;
        }

        var rnd = 0;

        // TODO: do this mathmatically instead of through conditions

        var stat = this._status();
        if (stat >= 0 && stat < 0.25) {
            // Start out between 3 - 6% increments
            rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
        } else if (stat >= 0.25 && stat < 0.65) {
            // increment between 0 - 3%
            rnd = (Math.random() * 3) / 100;
        } else if (stat >= 0.65 && stat < 0.9) {
            // increment between 0 - 2%
            rnd = (Math.random() * 2) / 100;
        } else if (stat >= 0.9 && stat < 0.99) {
            // finally, increment it .5 %
            rnd = 0.005;
        } else {
            // after 99%, don't increment:
            rnd = 0;
        }

        var pct = this._status() + rnd;
        this._set(pct);
    }

    private _status(): number {
        return this.status;
    }
}
