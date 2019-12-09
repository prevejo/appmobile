import { Operador } from './operador';
import { Operacao } from './operacao';

export interface GrupoHorario {
    operacao: OperacaoSemanal;
    partidas: Partida[];
}

export interface Partida {
    operador: Operador;
    horario: string;
}

export interface OperacaoSemanal {
    descricao: string;
    dias: Dia[];
}

export declare type Dia = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';

export const Semana: Dia[] = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];


const SegundaSexta: OperacaoSemanal = {
    descricao: 'Segunda a Sexta',
    dias: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta']
};

const Sabado: OperacaoSemanal = {
    descricao: 'Sábado',
    dias: ['Sábado']
};

const Domingo: OperacaoSemanal = {
    descricao: 'Domingo',
    dias: ['Domingo']
};

class OperacaoSemanalDia implements OperacaoSemanal {

    public descricao: string;
    public dias: Dia[];

    constructor(dia: Dia) {
        this.descricao = dia;
        this.dias = [dia];
    }

}


function identifyGruposHorarios(operacoes: Operacao[]): GrupoHorario[] {
    const operacoesSemanaisMap: Map<OperacaoSemanal, Operacao[]> = new Map();
    operacoesSemanaisMap.set(SegundaSexta, []);
    operacoesSemanaisMap.set(Sabado, []);
    operacoesSemanaisMap.set(Domingo, []);

    const operacoesSemanais: OperacaoSemanal[] = Array.from(operacoesSemanaisMap.keys());

    const operacoesDiferenciadas = operacoes.filter(operacao => {
        const diasOperacao = [operacao.segunda, operacao.terca, operacao.quarta, operacao.quinta, operacao.sexta, operacao.sabado, operacao.domingo];

        const operacoesSemanaisValidas = operacoesSemanais
            .filter(os => os.dias
                .filter(dia => diasOperacao[Semana.indexOf(dia)]).length == os.dias.length
            );

        operacoesSemanaisValidas.forEach(os => operacoesSemanaisMap.get(os).push(operacao));

        
        return operacoesSemanaisValidas.length == 0;
    });


    const diasMap: Map<OperacaoSemanal, Operacao[]> = new Map();
    Semana.forEach(dia => diasMap.set(new OperacaoSemanalDia(dia), []));

    operacoesDiferenciadas.forEach(operacao => {
        const diasOperacao = [operacao.segunda, operacao.terca, operacao.quarta, operacao.quinta, operacao.sexta, operacao.sabado, operacao.domingo];

        Array.from(diasMap.keys()).forEach(dia => {
            if (diasOperacao[Semana.indexOf(dia.dias[0])]) {
                diasMap.get(dia).push(operacao);
            }
        });
    })


    const gruposComuns = Array.from(operacoesSemanaisMap.entries())
        .filter(entry => entry[1].length > 0)
        .map(entry => {
            return {
                operacao: entry[0],
                partidas: entry[1].reduce((prev, next) => prev.concat(
                    next.horarios.map(op => {
                        return {
                            operador: next.operador,
                            horario: op.horario
                        } as Partida;
                    })
                ), []).sort(partidasComparator)
            } as GrupoHorario;
        });
    

    const gruposDiferenciados = Array.from(diasMap.entries())
        .filter(entry => entry[1].length > 0)
            .map(entry => {
                return {
                    operacao: entry[0],
                    partidas: entry[1].reduce((prev, next) => prev.concat(
                        next.horarios.map(op => {
                            return {
                                operador: next.operador,
                                horario: op.horario
                            } as Partida;
                        })
                    ), []).sort(partidasComparator)
                } as GrupoHorario;
            });

    return [...gruposComuns, ...gruposDiferenciados];
}

function partidasComparator(p1: Partida, p2: Partida): number {
    return Number(p1.horario.replace(':', '')) - Number(p2.horario.replace(':', ''));
}

export { identifyGruposHorarios as identifyGruposHorarios };