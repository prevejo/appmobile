import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NoticiasPage } from './pages/noticias/noticias.page';
import { LayoutModule } from 'src/app/layout/layout.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsCardComponent } from './components/news-card/news-card.component';
import { NewsListComponent } from './components/news-list/news-list.component';
import { DetalhamentoNoticiaPage } from './pages/detalhamento-noticia/detalhamento-noticia.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { OptionsPopoverComponent } from './components/news-card/options.popover';

@NgModule({
    imports: [
        IonicModule,
        RouterModule.forChild([
            {
                path: '',
                component: NoticiasPage
            }, {
                path: 'detalhe/:slug',
                component: DetalhamentoNoticiaPage
            }
        ]),
        LayoutModule,
        CommonModule,
        FormsModule,
        SharedModule
    ],
    declarations: [
        NoticiasPage,
        DetalhamentoNoticiaPage,
        NewsCardComponent,
        NewsListComponent,
        OptionsPopoverComponent
    ],
    entryComponents: [OptionsPopoverComponent]
})
export class NoticiasModule {}
