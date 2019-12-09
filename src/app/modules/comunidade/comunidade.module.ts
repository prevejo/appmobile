import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComunidadePage } from './pages/comunidade/comunidade.page';
import { LayoutModule } from 'src/app/layout/layout.module';
import { TopicoCardComponent } from './components/topico-card/topico-card.component';
import { ComentarioListComponent } from './components/comentario-list/comentario-list.component';
import { TopicoListComponent } from './components/topico-list/topico-list.component';
import { TopicoPage } from './pages/topico/topico.page';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { ComentarioFormComponent } from './components/comentario-form/comentario-form.component';
import { ComentarioComponent } from './components/comentario/comentario.component';
import { RelevanciaBadgeComponent } from './components/relevancia-badge/relevancia-badge.component';

@NgModule({
    imports: [
        IonicModule,
        RouterModule.forChild([
            {
                path: '',
                component: ComunidadePage
            }, {
                path: 'topico/:topicoId',
                component: TopicoPage
            }
        ]),
        LayoutModule,
        CommonModule,
        FormsModule,
        SharedModule
    ],
    declarations: [
        ComunidadePage,
        TopicoPage,
        TopicoCardComponent,
        ComentarioListComponent,
        TopicoListComponent,
        ComentarioFormComponent,
        ComentarioComponent,
        RelevanciaBadgeComponent
    ]
})
export class ComunidadeModule {}
