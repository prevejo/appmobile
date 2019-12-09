import { Operador } from './operador';
import { Horario } from './horario';

export interface Operacao {
    id: number;
    operador: Operador;
    segunda: boolean;
    terca: boolean;
    quarta: boolean;
    quinta: boolean;
    sexta: boolean;
    sabado: boolean;
    domingo: boolean;
    horarios: Horario[];
}