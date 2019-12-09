import { Component, Input } from '@angular/core';
import { NavigationHistoryService } from 'src/app/core/services/navigation-history.service';
import { LoadService } from 'src/app/core/services/load.service';
import { NotificationBarService } from 'src/app/core/services/notification-bar.service';

@Component({
    selector: 'page-header',
    templateUrl: './page-header.component.html',
    styleUrls: [ './page-header.component.scss' ]
})
export class PageHeaderComponent {

    @Input()
    public pageName?: string;

    @Input()
    public backButton?: boolean;

    constructor(
        private nav: NavigationHistoryService, 
        public loadService: LoadService,
        public notificationService: NotificationBarService) {
        nav.loadRouting();
    }

    canGoBack(): boolean {
        return this.backButton;
    }

}
