import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { PesquisaPage } from './pages/pesquisa/pesquisa.page';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule } from 'src/app/layout/layout.module';
import { TrajetoService } from './trajeto.service';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { ResultListComponent } from './components/result-list/result-list.component';
import { CommonModule } from '@angular/common';
import { RoutePanelComponent } from './components/route-panel/route-panel.component';
import { FormsModule } from '@angular/forms';
import { RoutePanelStateService } from './route-panel-state.service';
import { PesquisaStateService } from './pesquisa-state.service';
import { ListaPage } from './pages/lista/lista.page';
import { TrajetoStateService } from './trajeto-state-service';
import { ItemTrajetoComponent } from './components/item-trajeto/item-trajeto.component';
import { DetalhamentoTrajetoPage } from './pages/detalhamento-trajeto/detalhamento-trajeto.page';
import { TrajetoPanelComponent } from './components/trajeto-panel/trajeto-panel.component';
import { DetalhamentoLinhaPage } from './pages/detalhamento-linha/detalhamento-linha.page';
import { LinhaStateService } from './linha-state-service';
import { SentidoPanelComponent } from './components/sentido-panel/sentido-panel.component';
import { LinhaPanelComponent } from './components/linha-panel/linha-panel.component';
import { HorarioPanelComponent } from './components/horario-panel/horario-panel.component';
import { DetalhamentoParadaPage } from './pages/detalhamento-parada/detalhamento-parada.page';
import { LinhaListComponent } from './components/linha-list/linha-list.component';
import { EmbarquePanelComponent } from './components/embarque-panel/embarque-panel.component';
import { EmbarqueStateService } from './embarque-state.service';
import { AlertaEmbarquePage } from './pages/alerta-embarque/alerta-embarque.page';
import { AlarmeEmbarqueService } from './alarme-embarque.service';
import { AlertaFormComponent } from './components/alerta-form/alerta-form.component';
import { AlarmeComponent } from './components/alarme/alarme.component';
import { EmbarqueListComponent } from './components/embarque-list/embarque-list.component';
import { VeiculosPanelComponent } from './components/veiculos-panel/veiculos-panel.component';
import { VeiculosListComponent } from './components/veiculos-list/veiculos-list.component';
import { VeiculoStateService } from './veiculo-state.service';

@NgModule({
    imports: [
        IonicModule,
        RouterModule.forChild([
            {
                path: '',
                component: PesquisaPage
            }, {
                path: 'lista',
                component: ListaPage
            }, {
                path: 'trajeto',
                component: DetalhamentoTrajetoPage
            }, {
                path: 'linha/:percursoId',
                component: DetalhamentoLinhaPage
            }, {
                path: 'parada/:codigoParada',
                component: DetalhamentoParadaPage
            }, {
                path: 'alerta',
                component: AlertaEmbarquePage
            }
        ]),
        SharedModule,
        LayoutModule,
        CommonModule,
        FormsModule
    ],
    declarations: [
        PesquisaPage,
        ListaPage,
        DetalhamentoTrajetoPage,
        DetalhamentoLinhaPage,
        DetalhamentoParadaPage,
        AlertaEmbarquePage,
        SearchBarComponent,
        ResultListComponent,
        RoutePanelComponent,
        ItemTrajetoComponent,
        TrajetoPanelComponent,
        SentidoPanelComponent,
        LinhaPanelComponent,
        HorarioPanelComponent,
        LinhaListComponent,
        EmbarquePanelComponent,
        AlertaFormComponent,
        AlarmeComponent,
        EmbarqueListComponent,
        VeiculosPanelComponent,
        VeiculosListComponent
    ],
    providers: [
        TrajetoService,
        RoutePanelStateService,
        PesquisaStateService,
        TrajetoStateService,
        LinhaStateService,
        EmbarqueStateService,
        AlarmeEmbarqueService,
        VeiculoStateService
    ]
})
export class TrajetosModule {}
