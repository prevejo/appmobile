import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CoreModule } from '../core.module';

@Injectable({
    providedIn: CoreModule
})
export class NavigationHistoryService {

    private history: Array<string> = [];

    constructor(private router: Router) {
    }

    public loadRouting(): void {
        this.router.events.subscribe(e => {
            if (e instanceof NavigationEnd) {
                this.history.push(e.urlAfterRedirects);
            }
        });
    }

}
