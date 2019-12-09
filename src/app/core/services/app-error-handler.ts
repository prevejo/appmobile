import { ErrorHandler, Injectable, Injector} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class AppErrorsHandler implements ErrorHandler {

    constructor(private injector: Injector) {}

    handleError(error: Error | HttpErrorResponse) {
        const notService = this.injector.get(NotificationService);

        if (error instanceof HttpErrorResponse) {
            if (!navigator.onLine) {
                notService.showError('Estamos sem conexão');
            } else {
                notService.showError(this.findErrorByStatusCode(error.status), this.findDetails(error));
            }
        } else {
            notService.showError('Ops! Temos um error não esperado', this.findDetails(error)); 
        }
        
        console.error(error);
    }

    private findErrorByStatusCode(status: number): string {
        switch(status) {
            case 500: return 'Nosso serviço se encontra indisponível no momento';
            default: return 'Não foi possível carregar os dados';
        }
    }

    private findDetails(error: Error | HttpErrorResponse): string[] {
        const details: string[] = [];

        if (error.name) {
            details.push('Tipo: ' + error.name);
        }
        
        if (error.message) {
            details.push('Info: ' + error.message);
        }

        if (error instanceof HttpErrorResponse) {
            if (error.url) {
                details.push('URL: ' + error.url);
            }

            if (error.status) {
                details.push('Status: ' + error.status + (error.statusText ? ' - ' + error.statusText : ''));
            }
        }

        return details;
    }

}