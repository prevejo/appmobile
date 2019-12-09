import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpEventType, HttpResponseBase, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timer, Subscription, ConnectableObservable, of, throwError } from 'rxjs';
import { tap, publish, retry, catchError, timeout, finalize } from 'rxjs/operators';
import { LoadService } from './load.service';

@Injectable()
export class HttpLoadInterceptor implements HttpInterceptor {

    // The total number of requests made
    private reqsTotal = 0;

    // The number of requests completed (either successfully or not)
    private reqsCompleted = 0;

    // The amount of time spent fetching before showing the loading bar
    private latencyThreshold = 300;

    // $timeout handle for latencyThreshold
    private startTimeout: Subscription;

    private _currentLoad: ConnectableObservable<any>;


    constructor(private loadService: LoadService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let lastEvent: HttpEvent<any>;
        let hasError: boolean = false;

        return next.handle(req)
            .pipe(tap((event: HttpEvent<any>) => {
                lastEvent = event;

                if (event.type == HttpEventType.Response && event instanceof HttpResponseBase) {
                    this.handleResponse();
                } else if (event.type == HttpEventType.Sent) {
                    this.handleSent(req);
                    hasError = false;
                }
            })).pipe(catchError(err => {
                hasError = true;
                this.handleResponse();

                return throwError(err);
            }))
            .pipe(finalize(() => {
                if (lastEvent.type === HttpEventType.Sent && !hasError) {
                    this.handleResponse();
                }
            }))
            .pipe(retry(1))
            .pipe(timeout(60000));
    }

    private handleSent(req: HttpRequest<any>) {
        if (this.reqsTotal === 0) {
            this.startTimeout = timer(this.latencyThreshold).subscribe(() => {
                this._currentLoad = of(this.reqsCompleted / this.reqsTotal).pipe(publish()) as ConnectableObservable<any>;
                this.loadService.state().addLoad(this._currentLoad);
            });
        }
        this.reqsTotal++;
    }

    private handleResponse() {
        this.reqsCompleted++;

        if (this.reqsCompleted >= this.reqsTotal) {
            if (this._currentLoad) {
                this._currentLoad.connect();
            }

            this.startTimeout.unsubscribe();
            this.reqsCompleted = 0;
            this.reqsTotal = 0;
        }
    }

}