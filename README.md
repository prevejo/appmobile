# Introdução
Este projeto consiste na aplicação móvel da solução Prevejo.

# Install
cd pasta_do_rojeto/
npm install -g ionic
npm install

# Estrutura do projeto
https://itnext.io/choosing-a-highly-scalable-folder-structure-in-angular-d987de65ec7
https://github.com/mathisGarberg/angular-folder-structure

# Run WebServer
ionic serve

# Run Android
ionic cordova run android -l

# Build
ionic cordova build android --prod

# Dependencias

npm i leaflet --save
npm i -D @types/leaflet

npm i leaflet.locatecontrol --save
npm i -D @types/leaflet.locatecontrol

npm i leaflet.markercluster --save
npm i @types/leaflet.markercluster --save

npm i uuid
npm i @types/uuid

npm i leaflet.awesome-markers --save
npm i @types/leaflet.awesome-markers --save

npm i font-awesome@4.7.0 --save

npm i leaflet-easybutton --save

# Cordova
cordova plugin add cordova-plugin-geolocation