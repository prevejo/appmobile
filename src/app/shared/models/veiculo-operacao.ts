import { InstanteVeiculo } from './instante-veiculo';
import { Feature, LineString } from 'geojson';

export interface VeiculoOperacao {

    instante: InstanteVeiculo;
    trechoRestante: Feature<LineString, TrechoEstimativaProperties>;

}

export interface TrechoEstimativaProperties {

    distance: number;
    position: 'start' | 'middle' | 'end';

}
