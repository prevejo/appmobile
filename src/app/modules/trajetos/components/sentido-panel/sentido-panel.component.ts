import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';

@Component({
    selector: 'sentido-panel',
    templateUrl: './sentido-panel.component.html',
    styleUrls: ['./sentido-panel.component.scss']
})
export class SentidoPanelComponent implements OnInit {
    
    public toggle: boolean = false;

    public _sentido: string;

    @Input()
    public sentidos: string[];

    @Input()
    public options: LinhaPanelOption[];

    @Output()
    public onSentidoChange: EventEmitter<string> = new EventEmitter();

    ngOnInit() {
    }

    onToggleSentidoChange(event) {
        if ((this.sentido == this.sentidos[0] && event.detail.checked)
            || (this.sentido != this.sentidos[0] && !event.detail.checked)) {

            this.onSentidoChange.emit(event.detail.checked ? this.sentidos[1] : this.sentidos[0]);
        }
    }

    onClickSentido(sentido) {
        this.onSentidoChange.emit(sentido);
    }

    onOptionClick(option: LinhaPanelOption) {
        option.isSelected() ? option.unselect() : option.select();
    }

    @Input()
    get sentido(): string {
        return this._sentido;
    }

    set sentido(sentido: string) {
        this.toggle = sentido == this.sentidos[1];
        this._sentido = sentido;
    }

}

export interface LinhaPanelOption {
    name: string;
    select(): void;
    unselect(): void;
    isSelected(): boolean;
}