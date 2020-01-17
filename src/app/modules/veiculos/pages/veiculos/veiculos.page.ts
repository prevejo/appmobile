import { Component, OnInit } from '@angular/core';
import { VeiculosState, VeiculosStateService, OperacaoPercurso } from '../../veiculos-state.service';
import { MapConfig } from 'src/app/shared/components/map/map-config';
import { PercursoControlEvent } from '../../components/percursos-panel/percursos-panel.component';
import { Router } from '@angular/router';
import { VeiculosStoreService, PercursoSet } from '../../veiculos-store.service';
import { AlertController } from '@ionic/angular';

@Component({
    templateUrl: './veiculos.page.html',
    styleUrls: ['./veiculos.page.scss'],
})
export class VeiculosPage implements OnInit {

    public state: VeiculosState;
    public setSelecionado: PercursoSet;
    public sets: PercursoSet[];
    public percursoSelecionadoVeiculos: OperacaoPercurso;
    private lastRetailPanel: PanelState = null;
    public registradosButtonState: PanelState = { enabled: true, toggle: function() { this.enabled = !this.enabled; } };
    public percursosButtonState: PanelState = { enabled: false, toggle: function() { this.enabled = !this.enabled; } };
    public seletorButtonState: PanelState = { enabled: false, toggle: function() { this.enabled = !this.enabled; } };
    public veiculosButtonState: PanelState = { enabled: false, toggle: function() { this.enabled = !this.enabled; } };
    public mapConfig: MapConfig = {
        layersControlPosition: 'topleft',
        buttons: [{
            title: 'Exibir painel',
            icon: 'fa-ellipsis-v',
            position: 'bottomleft',
            clickFunction: (btn, map) => this.lastRetailPanel != null ? this.lastRetailPanel.toggle() : null,
            styleMap: {
                width: '30px',
                height: '30px',
                fontSize: '16px',
                backgroundColor: 'rgb(56, 128, 255)',
                color: 'white',
            },
            containerStyleMap: {
                borderColor: 'rgb(56, 128, 255)'
            }
        }]
    };

    constructor(private stateService: VeiculosStateService, private router: Router, private storeService: VeiculosStoreService, private alertController: AlertController) {}

    ngOnInit() {
        this.state = this.stateService.instanceState();

        this.state.percursoList.eventObservable.subscribe(event => event.type == 'add'
            ? this.onPercursoAdicionado()
            : null);

        this.storeService.retriveStore().subscribe(store => {
            if (store.sets.length == 0) {
                this.emptyState();
            } else {
                this.sets = store.sets;
            }
        });
    }

    ionViewDidEnter() {
        this.state.startUpdate();
    }

    ionViewWillLeave() {
        this.state.stopUpdate();
    }

    onSetSelecionado(set: PercursoSet) {
        this.setSelecionado = set;
        this.state.percursoList.setupListFromSet(this.setSelecionado);

        this.emptyState();
    }

    onClickBtnRegistro() {
        if (!this.state.percursoList.isSetSetup()) {
            this.createSetNameAlert(name => {
                const percursos = this.state.percursoList.percursos.map(perc => perc.percurso);

                this.storeService.storeSet(name, percursos)
                    .subscribe(set => {
                        this.setSelecionado = set;
                        this.state.percursoList.setupListFromSet(this.setSelecionado);
                    });
            });
        } else {
            this.setSelecionado = null;
            this.storeService.removeSet(this.state.percursoList.set).subscribe();
            this.state.percursoList.disconnectFromSet();
        }
    }

    onPercursoAdicionado() {
        this.openPanel(this.percursosButtonState);
    }

    emptyState() {
        this.retailPanel(this.registradosButtonState);
        this.openPanel(this.percursosButtonState);
    }

    onPercursoControlEvent(event: PercursoControlEvent) {
        if (event.type == 'remover') {
            this.state.percursoList.remove(event.percurso);
        } else if (event.type == 'detalhar') {
            this.router.navigate(['/trajetos/linha', event.percurso.percurso.id]);
        } else if (event.type == 'detalhar_veiculos') {
            this.state.selecionarPercurso(event.percurso, true);
            this.percursoSelecionadoVeiculos = event.percurso;
            this.openPanel(this.veiculosButtonState);
        } else if (event.type == 'selecionar') {
            this.state.selecionarPercurso(event.percurso);
        }
    }

    onVeiculosPanelBack() {
        this.percursoSelecionadoVeiculos = null;
        this.state.selecionarPercurso(null);
        this.retailPanel(this.veiculosButtonState);
        this.openPanel(this.percursosButtonState);
    }

    openPanel(panel: PanelState) {
        [this.percursosButtonState, this.seletorButtonState, this.veiculosButtonState]
            .filter(btn => btn.enabled)
            .forEach(btn => btn.toggle());

        panel.toggle();
    }

    retailPanel(panel: PanelState) {
        this.lastRetailPanel = panel;
        panel.toggle();
    }

    private createSetNameAlert(callback: (name: string) => void) {
        this.alertController.create({
            header: 'Identifique o registro',
            inputs: [
                {
                    name: 'name',
                    type: 'text',
                    placeholder: 'Descrição...'
                }
            ],
            buttons: [
                {
                    text: 'Registrar',
                    handler: (data: {name: string}) => {
                        if (data.name.length > 0) {
                            callback(data.name.substring(0, 10));
                        }
                    }
                }
            ]
        }).then(alert => alert.present());
    }

}

interface PanelState {
    enabled: boolean;
    toggle(): void;
}
