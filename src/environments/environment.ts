// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    forceHttpsUse: false,
    //api: '//prevejo.tk/api',
    api: 'http://localhost:8080',
    //api: 'http://192.168.168.1:8080',
    mapTiles: [
        {
            name: 'Mapa claro',
            url: 'https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=93fd0e6776254aa3997cd55752310e15'
        },{
            name: 'Mapa escuro',
            url: 'https://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=93fd0e6776254aa3997cd55752310e15'
        },{
            name: 'Google Map',
            url: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
            props: {
                maxZoom: 20,
                subdomains:['mt0','mt1','mt2','mt3']
            }
        },{
            name: 'Satélite',
            url: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
            props: {
                maxZoom: 20,
                subdomains:['mt0','mt1','mt2','mt3']
            }
        }
    ]
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
