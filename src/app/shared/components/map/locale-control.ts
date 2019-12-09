import * as L from 'leaflet';
import 'leaflet';
import 'leaflet.locatecontrol';

export class LocateControl extends L.Control.Locate {

    public onLocationFoundListener:(e:any) => void;
    public onClickListener:() => void;

    public constructor(options) {
        super(options);
    }

    public getMarker():any {
        return this['_marker'];
    }

    public fireClick() {
        this['_onClick']();
    }

    _onClick() {
        super['_onClick']();

        if (this.onClickListener) {
            this.onClickListener();
        }
    }

    _onLocationFound(event) {
        super['_onLocationFound'](event);

        if (this.onLocationFoundListener != undefined) {
            this.onLocationFoundListener(event);
        }
    }
}