import { Parada } from 'src/app/shared/models/parada';
import { Percurso } from 'src/app/shared/models/percurso';

export interface Trajeto {

    origem: any;
    destino: any;
    trechos: Trecho[];

}

export interface Trecho {

    areaEmbarque: any;
    areaDesembarque: any;
    percursos: TrechoPercurso[];

}

export interface TrechoPercurso {

    embarques: Parada[];
    desembarques: Parada[];
    percurso: Percurso;

}