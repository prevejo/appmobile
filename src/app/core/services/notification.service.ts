import { Injectable } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { ToastButton } from '@ionic/core';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    private lastErrorMsg: string = null;
    private lastErrorDetails: string = null;

    constructor(private toastController: ToastController, private alertController: AlertController) {
    }

    showInfo(msg: string) {
        this.toastController.create({
            message: msg,
            duration: 4000
        }).then(toast => {
            toast.present();
        });
    }

    showError(errorMsg: string, errorDetails?: string[]) {
        if (this.lastErrorMsg != null && this.lastErrorMsg === errorMsg) {
            return;
        }

        this.lastErrorMsg = errorMsg;

        this.toastController.create({
            message: errorMsg,
            duration: 4000,
            buttons: this.buttonsArray(errorDetails)
        }).then(toast => {
            toast.onDidDismiss().finally(() => {
                if (this.lastErrorMsg != null && this.lastErrorMsg === errorMsg) {
                    this.lastErrorMsg = null;
                }
            });
            toast.present();
        });
    }

    private buttonsArray(errorDetails?: string[]): ToastButton[] {
        if (errorDetails && errorDetails.length) {
            return  [
                {
                    icon: 'md-add',
                    handler: () => this.showErrorDetails(errorDetails)
                }
            ];
        }

        return [];
    }

    private showErrorDetails(details: string[]) {
        const errorMsg = details.join('<br/>');

        if (this.lastErrorDetails != null && this.lastErrorDetails === errorMsg) {
            return;
        }

        this.lastErrorDetails = errorMsg;

        this.alertController.create({
            header: 'Detalhes',
            message: errorMsg,
            buttons: ['OK']
        }).then(alert => {
            alert.onDidDismiss().finally(() => {
                if (this.lastErrorDetails != null && this.lastErrorDetails === errorMsg) {
                    this.lastErrorDetails = null;
                }
            });
            alert.present();
        });
    }

}
