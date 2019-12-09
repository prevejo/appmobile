#!/bin/bash

# Gerar imagem com:
# 	docker build -t prevejo-android-build -f Dockerfile-android-dev .
IMAGE_NAME='prevejo-android-build'
CONTAINER_NAME='container-build'

files[0]='angular.json'
files[1]='browserslist'
files[2]='karma.conf.js'
files[3]='package.json'
files[4]='resources'
files[5]='tsconfig.json'
files[6]='e2e'
files[7]='node_modules'
files[8]='package-lock.json'
files[9]='src'
files[10]='tsconfig.spec.json'
files[11]='config.xml'
files[12]='ionic.config.json'
files[13]='tsconfig.app.json'
files[14]='tslint.json'

docker create --name $CONTAINER_NAME -t $IMAGE_NAME
docker start $CONTAINER_NAME


for file in "${files[@]}"
do
	docker exec $CONTAINER_NAME rm -rf $file
	docker cp ./$file $(docker ps -aqf "name=$CONTAINER_NAME"):/ionicapp/
done

docker exec $CONTAINER_NAME rm -rf www
docker exec $CONTAINER_NAME ionic cordova build android --prod

docker cp $(docker ps -aqf "name=$CONTAINER_NAME"):/ionicapp/platforms/android/app/build/outputs .
chmod -R 777 outputs

docker stop $CONTAINER_NAME
docker rm /$(docker ps -aqf "name=$CONTAINER_NAME")

