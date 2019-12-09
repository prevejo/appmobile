import { Injectable } from '@angular/core';
import { Observable, concat, of } from 'rxjs';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { map, first, tap, shareReplay } from 'rxjs/operators';
import { Noticia, NoticiasService, NoticiasProvider } from './noticias.service';
import { NotificationIcon } from 'src/app/core/services/notification-bar.service';

@Injectable({
    providedIn: 'root'
})
export class InboxStateService implements InboxRegister {

    constructor(private localStorageService: LocalStorageService, private noticiasService: NoticiasService) {}

    retriveState(): Observable<InboxState> {
        return concat(
            this.localStorageService
                .retrive('inbox')
                .pipe(map(storaged => storaged.data as StoragedInbox))
                .pipe(map(inbox => new InboxStateImpl(inbox, this.noticiasService, this))),
            /*this.noticiasService.obterLastOnes()
                .pipe(map(lastOnes => new InboxStateImpl(lastOnes, this.noticiasService, this)))*/
                of(new InboxStateImpl([], this.noticiasService, this))
        ).pipe(first());
    }

    registerState(state: InboxState) {
        this.localStorageService.store('inbox', state.toStoragedInbox()).subscribe();
    }
}

interface InboxRegister {
    registerState(state: InboxState): void;
}

interface StoragedInbox {
    lastDate: number;
    noticias: NoticiaState[];
    opened: boolean;
}

export interface NoticiaState {
    noticia: Noticia;
    visited: boolean;
}

export interface InboxState {
    lastDate?: Date;
    noticias: NoticiaState[];

    remove(not: Noticia): void;
    update(): Observable<NoticiaState[]>;
    toStoragedInbox(): StoragedInbox;
    hasBeenOpened(): boolean;
    open(): Observable<NoticiaState[]>;
    unvisitedTotal(): number;
}

class InboxStateImpl implements InboxState {

    lastDate: Date = null;
    noticias: NoticiaState[] = [];
    private opened = true;

    constructor(initial: StoragedInbox | Noticia[], private noticiasProvider: NoticiasProvider, private register: InboxRegister) {
        if (initial instanceof Array) {
            this.fromStack(initial);
        } else {
            this.fromStoraged(initial as StoragedInbox);
        }
    }

    open(): Observable<NoticiaState[]> {
        return of(this.noticias)
            .pipe(tap(() => {
                this.opened = true;
            }));
    }

    hasBeenOpened(): boolean {
        return this.opened;
    }

    remove(not: Noticia) {
        const notState = this.noticias.filter(n => n.noticia.id === not.id)[0];

        const index = notState ? this.noticias.indexOf(notState) : -1;

        if (index !== -1) {
            this.noticias.splice(index, 1);
            this.register.registerState(this);
        }
    }

    update(): Observable<NoticiaState[]> {
        return (this.lastDate != null
            ? this.noticiasProvider.fetchLastOnesStartingFrom(this.lastDate)
            : this.noticiasProvider.fetchLastOnes())
            .pipe(map(noticias => {
                return noticias.map(n => {
                    return {
                        noticia: n,
                        visited: false
                    } as NoticiaState;
                });
            })).pipe(tap(noticias => {
                if (noticias.length) {
                    this.lastDate = null;
                    this.opened = false;
                    this.add(noticias);
                }
            })).pipe(shareReplay({refCount: true, bufferSize: 1}));
    }

    toStoragedInbox(): StoragedInbox {
        return {
            noticias: this.noticias,
            lastDate: this.lastDate != null ? this.lastDate.getTime() : null,
            opened: this.opened
        } as StoragedInbox;
    }

    unvisitedTotal(): number {
        return this.noticias.filter(n => !n.visited).length;
    }

    private add(noticias: NoticiaState[]) {
        if (noticias.length) {
            const max = 10;

            const result = this.noticias.concat(noticias)
                .sort((ns1, ns2) => new Date(ns2.noticia.dtPublicacao).getTime() - new Date(ns1.noticia.dtPublicacao).getTime());

            this.noticias.splice(0, this.noticias.length);
            (result.length > max ? result.slice(0, max) : result).forEach(element => this.noticias.push(element));

            if (this.lastDate == null) {
                this.lastDate = new Date(this.noticias[0].noticia.dtPublicacao);
            }

            this.register.registerState(this);
        }
    }

    private fromStoraged(storagedInbox: StoragedInbox) {
        this.lastDate = storagedInbox.lastDate !== null ? new Date(storagedInbox.lastDate) : null;
        this.opened = storagedInbox.opened;
        this.add(storagedInbox.noticias);
    }

    private fromStack(noticias: Noticia[]) {
        this.add(noticias.map(note => {
            return {
                noticia: note,
                visited: false
            } as NoticiaState;
        }));
    }

}


export class InboxNotification implements NotificationIcon {

    iconName = 'mail';

    constructor(private callBack: (not: NotificationIcon) => void) {}

    isHightLigthing(): boolean {
        return false;
    }

    clickCallback() {
        this.callBack(this);
    }

}
