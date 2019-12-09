import * as GeoJson from 'geojson';

export interface AreaIntegracao {

    id: number;
    descricao: string;
    geo?: GeoJson.MultiPolygon;

}