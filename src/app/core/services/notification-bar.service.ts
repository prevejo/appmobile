import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class NotificationBarService {

    notifications: NotificationIcon[] = [];

    register(notification: NotificationIcon) {
        if (this.notifications.indexOf(notification) == -1) {
            this.notifications.push(notification);
        }
    }

    unregister(notification: NotificationIcon) {
        const index = this.notifications.indexOf(notification);

        if (index != -1) {
            this.notifications.splice(index, 1);
        }
    }

}

export interface NotificationIcon {

    iconName: string;
    isHightLigthing(): boolean;
    clickCallback(): void;

}