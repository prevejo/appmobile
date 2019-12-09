import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Platform } from '@ionic/angular';
import { timeInterval, scan, filter, flatMap, map, first } from 'rxjs/operators';
import { NotificationBarService } from 'src/app/core/services/notification-bar.service';
import { InboxStateService, InboxNotification } from 'src/app/modules/noticias/inbox-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'home-page',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

    private exitSub: Subscription;
    private inboxLoadSubscription: Subscription;

    constructor(
        public platform: Platform,
        private notService: NotificationBarService,
        private inboxService: InboxStateService,
        private router: Router) {}

    ngOnInit() {
        this.inboxLoadSubscription = this.inboxService.retriveState()
            .pipe(first())
            .pipe(flatMap(state => state.update().pipe(map(n => {
                return { news: n, inbox: state };
            })))).subscribe(result => {
                if (!result.inbox.hasBeenOpened()) {
                    this.notService.register(new InboxNotification(not => {
                        this.router.navigate(['/noticias']);
                        this.notService.unregister(not);
                    }));
                }
            });
    }

    ionViewDidEnter() {
        this.exitSub = this.platform.backButton
            .pipe(timeInterval())
            .pipe(scan((acc, val) => val.interval < 300 ? acc + 1 : 0, 0))
            .pipe(filter(val => val == 1))
            .subscribe(() => {
                navigator['app'].exitApp();
            });
    }

    ionViewWillLeave() {
        this.exitSub.unsubscribe();
        this.inboxLoadSubscription.unsubscribe();
    }

    isCordovaPlatform() {
        return this.platform.is('cordova');
    }

}
