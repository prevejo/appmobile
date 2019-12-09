import { NgModule } from '@angular/core';

import { AppConfigService, APP_CONFIG } from './services/app-config.service';

@NgModule({
    imports: [
    ],
    declarations: [
    ],
    providers: [
        {
            provide: APP_CONFIG,
            useValue: AppConfigService
        }
    ],
    exports: [
    ]
})
export class CoreModule {}
