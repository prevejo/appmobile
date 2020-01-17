import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { SharedModule } from '../../shared/shared.module';
import { LayoutModule } from 'src/app/layout/layout.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VeiculosPage } from './pages/veiculos/veiculos.page';
import { VeiculosStateService } from './veiculos-state.service';
import { SeletorPercursoPanelComponent } from './components/seletor-percurso-panel/seletor-percurso-panel.component';
import { PercursosPanelComponent } from './components/percursos-panel/percursos-panel.component';
import { SearchBarPercursoComponent } from './components/search-bar-percurso/search-bar-percurso.component';
import { PercursoOptionsPopoverComponent } from './components/percursos-panel/options.popover';
import { VeiculosPercursoPanelComponent } from './components/veiculos-percurso-panel/veiculos-percurso-panel.component';
import { RegistradosPanelComponent } from './components/registrados-panel/registrados-panel.component';
import { VeiculosStoreService } from './veiculos-store.service';

@NgModule({
    imports: [
        IonicModule,
        RouterModule.forChild([
            {
                path: '',
                component: VeiculosPage
            }
        ]),
        SharedModule,
        LayoutModule,
        CommonModule,
        FormsModule
    ],
    declarations: [
        VeiculosPage,
        SeletorPercursoPanelComponent,
        PercursosPanelComponent,
        SearchBarPercursoComponent,
        PercursoOptionsPopoverComponent,
        VeiculosPercursoPanelComponent,
        RegistradosPanelComponent
    ],
    providers: [
        VeiculosStateService,
        VeiculosStoreService
    ],
    entryComponents: [PercursoOptionsPopoverComponent]
})
export class VeiculosModule {}
