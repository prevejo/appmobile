import { NgModule } from '@angular/core';

import { MapComponent } from './components/map/map.component';
import { CoreModule } from '../core/core.module';
import { CommonModule } from '@angular/common';
import { ToUpperFirstPipe } from './pipes/toUpperFirst.pipe';
import { PastTimePipe } from './pipes/pastTime.pipe';
import { ToDatePipe } from './pipes/toDate.pipe';
import { ShortPastTimePipe } from './pipes/shortPastTime.pipe';

@NgModule({
  imports: [
    CoreModule,
    CommonModule
  ],
  declarations: [
    MapComponent,
    ToUpperFirstPipe,
    PastTimePipe,
    ToDatePipe,
    ShortPastTimePipe
  ],
  exports: [
    MapComponent,
    ToUpperFirstPipe,
    PastTimePipe,
    ToDatePipe,
    ShortPastTimePipe
  ]
})
export class SharedModule {}
