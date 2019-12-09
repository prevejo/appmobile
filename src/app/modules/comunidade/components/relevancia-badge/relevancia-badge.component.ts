import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Comentario, ComentarioService } from '../../comentario.service';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
    selector: 'relevancia-badge',
    templateUrl: './relevancia-badge.component.html',
    styleUrls: ['./relevancia-badge.component.scss']
})
export class RelevanciaBadgeComponent implements OnInit, OnDestroy {

    @Input()
    public comentario: Comentario;

    disabled: boolean = false;
    loading: boolean = false;

    private _subscription: Subscription = null;

    constructor(private localStorageService: LocalStorageService, private comentarioService: ComentarioService) {}

    ngOnInit() {
        this.localStorageService.retrive('relevancia_history').subscribe(history => {
            if (history.data && (history.data as number[]).indexOf(this.comentario.id) != -1) {
                this.disabled = true;
            }
        });
    }

    onClick(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.disabled) {
            this.disabled = true;
            this.loading = true;

            this._subscription = this.comentarioService
                .incrementarRelevancia(this.comentario)
                .pipe(delay(300))
                .subscribe(
                    () => {
                        this.comentario.relevancia += 1;
                        this.localStorageService.retriveAndStore(
                                'relevancia_history', 
                                (data: number[]) => this.updateHistory(data)
                            ).subscribe();
                    },
                    () => this.disabled = false,
                    () => this.loading = false
                );
        }
    }

    ngOnDestroy() {
        if (this._subscription != null) {
            this._subscription.unsubscribe();
        }
    }

    private updateHistory(history: number[]): number[] {
        if (history == null) {
            history = [];
        }

        if (history.indexOf(this.comentario.id) == -1) {
            history.push(this.comentario.id);
        }

        return history;
    }

}
