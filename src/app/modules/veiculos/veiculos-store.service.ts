import { Injectable } from '@angular/core';
import { Percurso } from 'src/app/shared/models/percurso';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { Observable, concat, of } from 'rxjs';
import { map, first, tap } from 'rxjs/operators';

@Injectable()
export class VeiculosStoreService {

    private storeKey: string = 'veiculos_store';

    constructor(private localStoreService: LocalStorageService) {}

    retriveStore(): Observable<VeiculosStore> {
        return concat(
            this.localStoreService.retrive(this.storeKey).pipe(map(s => s.data as VeiculosStore)),
            of(this.emptyStore())
        ).pipe(first())
        .pipe(tap(store => {
            store.sets = store.sets.map(set => new PercursoSetImpl(set.name, set.percursos, this))
        }));
    }

    storeSet(name: string, percursos: Percurso[]): Observable<PercursoSet> {
        const set = new PercursoSetImpl(name, percursos, this);

        return this.localStoreService.retriveAndStore(this.storeKey, (store: VeiculosStore) => {
            if (store == null) {
                store = this.emptyStore();
            }

            store.sets = [
                set,
                ...store.sets.filter(s => s.name != set.name)
            ];

            return store;
        }).pipe(map(store => set));
    }

    removeSet(set: PercursoSet): Observable<VeiculosStore> {
        return this.localStoreService.retriveAndStore(this.storeKey, (store: VeiculosStore) => {
            if (store == null) {
                store = this.emptyStore();
            }

            store.sets = store.sets.filter(s => s.name != set.name);

            return store;
        });
    }

    private emptyStore(): VeiculosStore {
        return { sets: [] } as VeiculosStore;
    }

}

export interface VeiculosStore {

    sets: PercursoSet[];

}

export interface PercursoSet {

    name: string;
    percursos: Percurso[];

    updateAndSave(percursos: Percurso[]): Observable<PercursoSet>;
    linhaList(): string;

}

class PercursoSetImpl implements PercursoSet {

    constructor(public name: string, public percursos: Percurso[], private storeService: VeiculosStoreService) {}

    updateAndSave(percursos: Percurso[]): Observable<PercursoSet> {
        this.percursos = percursos.slice();
        return this.storeService.storeSet(this.name, this.percursos);
    }

    linhaList(): string {
        return this.percursos.map(perc => perc.linha.numero).join(' | ');
    }

}