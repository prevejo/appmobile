import * as L from 'leaflet';

export interface MapConfig {
    requestUserLocation?: boolean,
    layersControlPosition?: L.ControlPosition | 'disabled',
    buttons?: ButtonControl[]
}

interface ButtonControl {
    id?: string,
    position: L.ControlPosition,
    icon: string,
    title: string,
    clickFunction: (btn: any, map: L.Map) => void;
    styleMap?: { [key:string]: any },
    containerStyleMap?: { [key:string]: any }
}