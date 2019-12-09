import { TrechoPercurso } from './trajeto';
import { FeatureShape } from './feature-shape';
import { ParadaFeatureShape, ShapeColor } from './parada-feature-shape';

export interface TrechoPercursoCollection {

    position: TrechoPosition;
    percursoSelecionado: TrechoPercurso;
    percursos: TrechoPercurso[];

    selecionarPercurso(percurso: TrechoPercurso): void;
    addPercursoSelecionadoListener(listener: (percurso: TrechoPercurso) => void): void;
    trocarPercurso(): void;

}

export interface TrechoPosition {
    position: 'start' | 'middle' | 'end';
    getFeatureLayerShape(): FeatureShape
    getColor(): ShapeColor;
    getDescription(): 'start' | 'middle' | 'end';
}


class StartTrechoPosition implements TrechoPosition {
    position: 'start';
    getFeatureLayerShape(): FeatureShape {
        return new ParadaFeatureShape(this.getColor());
    }
    getColor(): ShapeColor {
        return 'darkgreen';
    }
    getDescription(): 'start' | 'middle' | 'end' {
        return 'start';
    }
}

class MiddleTrechoPosition implements TrechoPosition {
    position: 'middle';
    getFeatureLayerShape(): FeatureShape {
        return new ParadaFeatureShape('cadetblue');
    }
    getColor(): ShapeColor {
        return 'cadetblue';
    }
    getDescription(): 'start' | 'middle' | 'end' {
        return 'middle';
    }
}

class EndTrechoPosition implements TrechoPosition {
    position: 'end';
    getFeatureLayerShape(): FeatureShape {
        return new ParadaFeatureShape('blue');
    }
    getColor(): ShapeColor {
        return 'blue';
    }
    getDescription(): 'start' | 'middle' | 'end' {
        return 'end';
    }
}

const POSITIONS: { [key:string]:TrechoPosition; } = {
    'start': new StartTrechoPosition(),
    'middle': new MiddleTrechoPosition(),
    'end': new EndTrechoPosition()
};

 export const buildPostionFor = (position: 'start' | 'middle' | 'end') => {
     return POSITIONS[position]
 };