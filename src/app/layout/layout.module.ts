import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { PageHeaderComponent } from './page-header/page-header.component';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { LoadBarComponent } from './loadbar/loadbar.component';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        CoreModule
    ],
    declarations: [
        PageHeaderComponent,
        LoadBarComponent
    ],
    exports: [
        PageHeaderComponent,
        LoadBarComponent
    ]
})
export class LayoutModule {}
