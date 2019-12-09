export const environment = {
    production: true,
    forceHttpsUse: true,
    api: '//prevejo.tk/api',
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
