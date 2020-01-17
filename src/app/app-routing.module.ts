import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadChildren: () => import('./modules/home/home.module').then( m => m.HomeModule) },
    { path: 'trajetos', loadChildren: () => import('./modules/trajetos/trajetos.module').then( m => m.TrajetosModule) },
    { path: 'comunidade', loadChildren: () => import('./modules/comunidade/comunidade.module').then( m => m.ComunidadeModule) },
    { path: 'noticias', loadChildren: () => import('./modules/noticias/noticias.module').then( m => m.NoticiasModule) },
    { path: 'veiculos', loadChildren: () => import('./modules/veiculos/veiculos.module').then( m => m.VeiculosModule) }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
