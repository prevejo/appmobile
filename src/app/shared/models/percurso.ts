import { Linha } from './linha';
import { GeoJsonProperties } from 'geojson';

export interface Percurso extends GeoJsonProperties {

    id: number;
    sentido: string;
    origem: string;
    destino: string;
    linha: Linha;

}