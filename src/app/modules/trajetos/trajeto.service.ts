import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Trajeto } from '../../shared/models/trajeto';
import { AppConfig, APP_CONFIG } from 'src/app/core/services/app-config.service';
import { RouteLocation } from 'src/app/shared/models/route-location';

@Injectable()
export class TrajetoService {

    private api: string;

    constructor(private http: HttpClient, @Inject(APP_CONFIG) appConfig: AppConfig) {
        this.api = appConfig.apiUrl;
    }

    obterTrajetos(origem: RouteLocation, destino: RouteLocation): Observable<Trajeto[]> {
        return this.http.get(this.api + '/trajeto/'
                + origem.type.serviceType + '/' + origem.getServiceId() + '/'
                + destino.type.serviceType + '/' + destino.getServiceId())
            .pipe(map(resp => {
                const trajetos = resp as Trajeto[];

                return trajetos;
            }));
    }

}
