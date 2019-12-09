import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AppConfig {
    apiUrl: string;
    mapTiles: MapTileConfig[]
}

export const AppConfigService: AppConfig = {
    apiUrl: environment.api,
    mapTiles: environment.mapTiles.map(obj => {
        return {
            name: obj.name,
            url: obj.url,
            props: obj.props
        };
    })
};

export let APP_CONFIG = new InjectionToken<AppConfig>('AppConfig');


export interface MapTileConfig {
    name: string;
    url: string;
    props?: any;
}