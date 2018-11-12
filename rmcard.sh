#!/bin/sh
rm -f ehr@0.0.1.bna networkadmin.card
composer card delete -c admin@ehr
docker kill $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi $(docker images dev-* -q)
rm -rf ~/.composer
