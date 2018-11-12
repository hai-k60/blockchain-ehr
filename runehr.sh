#!/bin/sh
cd fabric-dev-servers/
#./downloadFabric.sh
./startFabric.sh
./createPeerAdminCard.sh
cd ..
composer archive create -t dir -n .

composer network install --card PeerAdmin@hlfv1 --archiveFile ehr@0.0.1.bna

composer network start --networkName ehr --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card
composer card import --file networkadmin.card
composer network ping --card admin@ehr
