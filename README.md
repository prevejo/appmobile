# Introdução
Este projeto consiste na aplicação móvel/web da solução Prevejo.


# Estrutura do projeto
https://itnext.io/choosing-a-highly-scalable-folder-structure-in-angular-d987de65ec7

https://github.com/mathisGarberg/angular-folder-structure


# Install
cd pasta_do_rojeto/

npm install -g ionic

npm install

# Run WebServer
ionic serve

# Run Android
ionic cordova run android -l

# Build
ionic cordova build android --prod


# Dependências
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


# Docker
O build do arquivo Dockerfile-prod realiza o build do projeto e disponibilização dos arquivos resultantes em uma imagem com Nginx.

O build do arquivo Dockerfile-android realiza o build do projeto e produção do pacote .apk para instalação no Android do aplicativo.

O build do arquivo Dockerfile-android-dev produz uma imagem temporária que é reaproveitada pelos scripts:

--> ./build-apk.sh : realiza o build novamente do projeto reaproveitando imagem existe.

--> ./copy-apk.sh : copia o pacote .apk da imagem existe para a pasta local ./outputs