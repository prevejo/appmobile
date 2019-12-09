import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';


function isUsingHttps() {
    return location.protocol.indexOf('https') != -1;
}

function goToHttps() {
    location.replace('https://' + location.host + location.pathname);
}

function startApplication() {
    if (environment.production) {
        enableProdMode();
    }

    platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.log(err));
}

if (environment.forceHttpsUse && !isUsingHttps()) {
    goToHttps();
} else {
    startApplication();
}
