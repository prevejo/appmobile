#!/bin/bash

# Gerar imagem com:
# 	docker build -t prevejo-android-build -f Dockerfile-android-dev .
IMAGE_NAME='prevejo-android-build'
CONTAINER_NAME='container-build'

docker create --name $CONTAINER_NAME -t $IMAGE_NAME
docker cp $(docker ps -aqf "name=$CONTAINER_NAME"):/ionicapp/platforms/android/app/build/outputs .
docker rm /$(docker ps -aqf "name=$CONTAINER_NAME")

chmod -R 777 outputs
