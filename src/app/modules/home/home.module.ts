import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { HomePage } from './pages/home/home.page';
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule } from 'src/app/layout/layout.module';
import { HomeCardComponent } from './components/home-card/home-card.component';
import { AppButtonComponent } from './components/app-button/app-button.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ]),
    CommonModule,
    SharedModule,
    LayoutModule
  ],
  declarations: [
    HomePage,
    HomeCardComponent,
    AppButtonComponent
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class HomeModule {}
