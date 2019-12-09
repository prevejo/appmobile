import { Point } from 'geojson';

export interface InstanteVeiculo {

    veiculo: Veiculo;
    linha: string;
    sentido: string;
    instante: Instante;

}

export interface Veiculo {

    numero: string;
    operadora: string;

}

interface Instante {

    data: string;
    localizacao: Point;
    direcao: number;
    velocidade: Velocidade;

}

interface Velocidade {

    unidade: 'KM_POR_HORA' | 'METROS_POR_SEG';
    valor: number;

}
