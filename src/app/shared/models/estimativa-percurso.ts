import { Percurso } from './percurso';
import { Parada } from './parada';
import { FeatureCollection, LineString } from 'geojson';
import { InstanteVeiculo } from './instante-veiculo';
import { TrechoEstimativaProperties } from './veiculo-operacao';

export interface EstimativaPercurso {

    percurso: Percurso;
    endPoint: Parada;
    chegadas: EstimativaEmbarque[];

}

export interface EstimativaEmbarque {

    startPoint: InstanteVeiculo;
    horaPrevista: number;
    duracao: number;
    distancia: number;
    trecho: FeatureCollection<LineString, TrechoEstimativaProperties>;

}
