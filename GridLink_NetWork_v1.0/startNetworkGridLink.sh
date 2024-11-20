#!/bin/bash

echo "------------Register the ca admin for each organization—----------------"

docker compose -f docker/docker-compose-ca.yaml up -d
sleep 3

sudo chmod -R 777 organizations/

echo "------------Register and enroll the users for each organization—-----------"

chmod +x registerEnroll.sh

./registerEnroll.sh
sleep 3

echo "—-------------Build the infrastructure—-----------------"

docker compose -f docker/docker-compose-4org.yaml up -d
sleep 3

echo "-------------Generate the genesis block—-------------------------------"

export FABRIC_CFG_PATH=${PWD}/config

export CHANNEL_NAME=gridlinkchannel

configtxgen -profile FourOrgsChannel -outputBlock ${PWD}/channel-artifacts/${CHANNEL_NAME}.block -channelID $CHANNEL_NAME
sleep 2

echo "------ Create the application channel------"

export ORDERER_CA=${PWD}/organizations/ordererOrganizations/gridlink.com/orderers/orderer.gridlink.com/msp/tlscacerts/tlsca.gridlink.com-cert.pem

export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/organizations/ordererOrganizations/gridlink.com/orderers/orderer.gridlink.com/tls/server.crt

export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/organizations/ordererOrganizations/gridlink.com/orderers/orderer.gridlink.com/tls/server.key

osnadmin channel join --channelID $CHANNEL_NAME --config-block ${PWD}/channel-artifacts/$CHANNEL_NAME.block -o localhost:7053 --ca-file $ORDERER_CA --client-cert $ORDERER_ADMIN_TLS_SIGN_CERT --client-key $ORDERER_ADMIN_TLS_PRIVATE_KEY
sleep 2

osnadmin channel list -o localhost:7053 --ca-file $ORDERER_CA --client-cert $ORDERER_ADMIN_TLS_SIGN_CERT --client-key $ORDERER_ADMIN_TLS_PRIVATE_KEY
sleep 2

export FABRIC_CFG_PATH=${PWD}/peercfg
export CORE_PEER_LOCALMSPID=ProducerMSP
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/producer.gridlink.com/peers/peer0.producer.gridlink.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/producer.gridlink.com/users/Admin@producer.gridlink.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export PRODUCER_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/producer.gridlink.com/peers/peer0.producer.gridlink.com/tls/ca.crt
export CONSUMER_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/consumer.gridlink.com/peers/peer0.consumer.gridlink.com/tls/ca.crt
export UTILITYCOMPANY_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/utilitycompany.gridlink.com/peers/peer0.utilitycompany.gridlink.com/tls/ca.crt
export REGULATORYBODY_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/regulatorybody.gridlink.com/peers/peer0.regulatorybody.gridlink.com/tls/ca.crt
sleep 2

echo "—---------------Join producer peer to the channel—-------------"

echo ${FABRIC_CFG_PATH}
sleep 2
peer channel join -b ${PWD}/channel-artifacts/${CHANNEL_NAME}.block
sleep 3

echo "-----channel List----"
peer channel list

echo "—-------------producer anchor peer update—-----------"

peer channel fetch config ${PWD}/channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
sleep 1

cd channel-artifacts

configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq '.data.data[0].payload.data.config' config_block.json > config.json

cp config.json config_copy.json

jq '.channel_group.groups.Application.groups.ProducerMSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.producer.gridlink.com","port": 7051}]},"version": "0"}}' config_copy.json > modified_config.json

configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
configtxlator compute_update --channel_id ${CHANNEL_NAME} --original config.pb --updated modified_config.pb --output config_update.pb

configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb

cd ..

peer channel update -f ${PWD}/channel-artifacts/config_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050  --ordererTLSHostnameOverride orderer.gridlink.com --tls --cafile $ORDERER_CA
sleep 1

echo "—---------------package chaincode—-------------"

peer lifecycle chaincode package gridlink.tar.gz --path ../Chaincode/gridlink --lang node --label gridlink_1.0
sleep 1

echo "—---------------install chaincode in producer peer—-------------"

peer lifecycle chaincode install gridlink.tar.gz
sleep 3



peer lifecycle chaincode queryinstalled
sleep 1

export CC_PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid gridlink.tar.gz)

echo "—---------------Approve chaincode in producer peer—-------------"

peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --channelID $CHANNEL_NAME --name Gridlink --version 1.0  --collections-config ../Chaincode/gridlink/collection-gridlink.json  --package-id $CC_PACKAGE_ID --sequence 1  --tls --cafile $ORDERER_CA --waitForEvent
sleep 2

# peer channel fetch config ${PWD}/channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
# cd channel-artifacts

# configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
# jq '.data.data[0].payload.data.config' config_block.json > config.json

# cp config.json config_copy.json
# jq '.channel_group.groups.Application.groups.ProducerMSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.producer.gridlink.com","port": 7051}]},"version": "0"}}' config_copy.json > modified_config.json

# configtxlator proto_encode --input config.json --type common.Config --output config.pb
# configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
# configtxlator compute_update --channel_id ${CHANNEL_NAME} --original config.pb --updated modified_config.pb --output config_update.pb

# configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
# echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
# configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb

# cd ..
# peer channel update -f ${PWD}/channel-artifacts/config_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --tls --cafile $ORDERER_CA
# sleep 1

# # Chaincode Packaging and Installation for Org1
# echo "-------------Package and Install Chaincode for Org1-------------"

# cp -r ../fabric-samples/asset-transfer-basic/Gridlink ../Chaincode
# peer lifecycle chaincode package basic.tar.gz --pGridlink/ --lang node --label basic_1.0

# peer lifecycle chaincode install basic.tar.gz
# sleep 3
# peer lifecycle chaincode queryinstalled

# export CC_PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid basic.tar.gz)
# peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --channelID $CHANNEL_NAME --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA --waitForEvent
# sleep 1

export CORE_PEER_LOCALMSPID=ConsumerMSP
export CORE_PEER_ADDRESS=localhost:9051 
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/consumer.gridlink.com/peers/peer0.consumer.gridlink.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/consumer.gridlink.com/users/Admin@consumer.gridlink.com/msp

echo "—---------------Join consumer peer to the channel—-------------"

peer channel join -b ${PWD}/channel-artifacts/$CHANNEL_NAME.block
sleep 1
peer channel list

echo "—-------------consumer anchor peer update—-----------"

peer channel fetch config ${PWD}/channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
sleep 1

cd channel-artifacts

configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq '.data.data[0].payload.data.config' config_block.json > config.json
cp config.json config_copy.json

jq '.channel_group.groups.Application.groups.ConsumerMSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.consumer.gridlink.com","port": 9051}]},"version": "0"}}' config_copy.json > modified_config.json

configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
configtxlator compute_update --channel_id $CHANNEL_NAME --original config.pb --updated modified_config.pb --output config_update.pb

configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb

cd ..

peer channel update -f ${PWD}/channel-artifacts/config_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050  --ordererTLSHostnameOverride orderer.gridlink.com --tls --cafile $ORDERER_CA
sleep 1

echo "—---------------install chaincode in consumer peer—-------------"

peer lifecycle chaincode install gridlink.tar.gz
sleep 3

peer lifecycle chaincode queryinstalled

echo "—---------------Approve chaincode in consumer peer—-------------"

peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --channelID $CHANNEL_NAME --name Gridlink --version 1.0  --collections-config ../Chaincode/gridlink/collection-gridlink.json  --package-id $CC_PACKAGE_ID --sequence 1  --tls --cafile $ORDERER_CA --waitForEvent
sleep 1
# peer channel fetch config ${PWD}/channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
# cd channel-artifacts

# configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
# jq '.data.data[0].payload.data.config' config_block.json > config.json

# cp config.json config_copy.json
# jq '.channel_group.groups.Application.groups.ConsumerMSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.producer.gridlink.com","port": 7051}]},"version": "0"}}' config_copy.json > modified_config.json

# configtxlator proto_encode --input config.json --type common.Config --output config.pb
# configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
# configtxlator compute_update --channel_id ${CHANNEL_NAME} --original config.pb --updated modified_config.pb --output config_update.pb

# configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
# echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
# configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb

# cd ..
# peer channel update -f ${PWD}/channel-artifacts/config_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --tls --cafile $ORDERER_CA
# sleep 1

# # Chaincode Packaging and Installation for Org1
# echo "-------------Package and Install Chaincode for Org1-------------"

# cp -r ../fabric-samples/asset-transfer-basic/Gridlink ../Chaincode
# peer lifecycle chaincode package basic.tar.gz --pGridlink/ --lang node --label basic_1.0

# peer lifecycle chaincode install basic.tar.gz
# sleep 3
# peer lifecycle chaincode queryinstalled

# export CC_PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid basic.tar.gz)
# peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --channelID $CHANNEL_NAME --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA --waitForEvent
# sleep 1


export CORE_PEER_LOCALMSPID=UtilityCompanyMSP 
export CORE_PEER_ADDRESS=localhost:11051 
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/utilitycompany.gridlink.com/peers/peer0.utilitycompany.gridlink.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/utilitycompany.gridlink.com/users/Admin@utilitycompany.gridlink.com/msp

echo "—---------------Join utilitycompany peer to the channel—-------------"

peer channel join -b ${PWD}/channel-artifacts/$CHANNEL_NAME.block
sleep 1
peer channel list

echo "—-------------utilitycompany anchor peer update—-----------"

peer channel fetch config ${PWD}/channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
sleep 1

cd channel-artifacts

configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq '.data.data[0].payload.data.config' config_block.json > config.json
cp config.json config_copy.json

jq '.channel_group.groups.Application.groups.UtilityCompanyMSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.utilitycompany.gridlink.com","port": 11051}]},"version": "0"}}' config_copy.json > modified_config.json

configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
configtxlator compute_update --channel_id $CHANNEL_NAME --original config.pb --updated modified_config.pb --output config_update.pb

configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb

cd ..

peer channel update -f ${PWD}/channel-artifacts/config_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050  --ordererTLSHostnameOverride orderer.gridlink.com --tls --cafile $ORDERER_CA
sleep 1

peer channel getinfo -c $CHANNEL_NAME


echo "—---------------install chaincode in utilitycompany peer—-------------"

peer lifecycle chaincode install gridlink.tar.gz
sleep 3

peer lifecycle chaincode queryinstalled

echo "—---------------Approve chaincode in utilitycompany peer—-------------"

peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --channelID $CHANNEL_NAME --name Gridlink --version 1.0  --collections-config ../Chaincode/gridlink/collection-gridlink.json  --package-id $CC_PACKAGE_ID --sequence 1  --tls --cafile $ORDERER_CA --waitForEvent
sleep 1
# peer channel fetch config ${PWD}/channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
# cd channel-artifacts

# configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
# jq '.data.data[0].payload.data.config' config_block.json > config.json

# cp config.json config_copy.json
# jq '.channel_group.groups.Application.groups.UtilityCompanyMSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.producer.gridlink.com","port": 7051}]},"version": "0"}}' config_copy.json > modified_config.json

# configtxlator proto_encode --input config.json --type common.Config --output config.pb
# configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
# configtxlator compute_update --channel_id ${CHANNEL_NAME} --original config.pb --updated modified_config.pb --output config_update.pb

# configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
# echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
# configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb

# cd ..
# peer channel update -f ${PWD}/channel-artifacts/config_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --tls --cafile $ORDERER_CA
# sleep 1

# # Chaincode Packaging and Installation for Org1
# echo "-------------Package and Install Chaincode for Org1-------------"

# cp -r ../fabric-samples/asset-transfer-basic/Gridlink ../Chaincode
# peer lifecycle chaincode package basic.tar.gz --pGridlink/ --lang node --label basic_1.0

# peer lifecycle chaincode install basic.tar.gz
# sleep 3
# peer lifecycle chaincode queryinstalled

# export CC_PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid basic.tar.gz)
# peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --channelID $CHANNEL_NAME --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA --waitForEvent
# sleep 1

export CORE_PEER_LOCALMSPID=RegulatoryBodyMSP
export CORE_PEER_ADDRESS=localhost:12051 
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/regulatorybody.gridlink.com/peers/peer0.regulatorybody.gridlink.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/regulatorybody.gridlink.com/users/Admin@regulatorybody.gridlink.com/msp

echo "—---------------Join regulatorybody peer to the channel—-------------"

peer channel join -b ${PWD}/channel-artifacts/$CHANNEL_NAME.block
sleep 1
peer channel list

echo "—-------------regulatorybody anchor peer update—-----------"

peer channel fetch config ${PWD}/channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
sleep 1

cd channel-artifacts

configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
jq '.data.data[0].payload.data.config' config_block.json > config.json
cp config.json config_copy.json

jq '.channel_group.groups.Application.groups.RegulatoryBodyMSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.regulatorybody.gridlink.com","port": 9051}]},"version": "0"}}' config_copy.json > modified_config.json

configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
configtxlator compute_update --channel_id $CHANNEL_NAME --original config.pb --updated modified_config.pb --output config_update.pb

configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb

cd ..

peer channel update -f ${PWD}/channel-artifacts/config_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050  --ordererTLSHostnameOverride orderer.gridlink.com --tls --cafile $ORDERER_CA
sleep 1

echo "—---------------install chaincode in regulatorybody peer—-------------"

peer lifecycle chaincode install gridlink.tar.gz
sleep 3

peer lifecycle chaincode queryinstalled

echo "—---------------Approve chaincode in regulatorybody peer—-------------"

peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --channelID $CHANNEL_NAME --name Gridlink --version 1.0  --collections-config ../Chaincode/gridlink/collection-gridlink.json  --package-id $CC_PACKAGE_ID --sequence 1  --tls --cafile $ORDERER_CA --waitForEvent
sleep 1
# peer channel fetch config ${PWD}/channel-artifacts/config_block.pb -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com -c $CHANNEL_NAME --tls --cafile $ORDERER_CA
# cd channel-artifacts

# configtxlator proto_decode --input config_block.pb --type common.Block --output config_block.json
# jq '.data.data[0].payload.data.config' config_block.json > config.json

# cp config.json config_copy.json
# jq '.channel_group.groups.Application.groups.CustomersMSP.values += {"AnchorPeers":{"mod_policy": "Admins","value":{"anchor_peers": [{"host": "peer0.producer.gridlink.com","port": 7051}]},"version": "0"}}' config_copy.json > modified_config.json

# configtxlator proto_encode --input config.json --type common.Config --output config.pb
# configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
# configtxlator compute_update --channel_id ${CHANNEL_NAME} --original config.pb --updated modified_config.pb --output config_update.pb

# configtxlator proto_decode --input config_update.pb --type common.ConfigUpdate --output config_update.json
# echo '{"payload":{"header":{"channel_header":{"channel_id":"'$CHANNEL_NAME'", "type":2}},"data":{"config_update":'$(cat config_update.json)'}}}' | jq . > config_update_in_envelope.json
# configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb

# cd ..
# peer channel update -f ${PWD}/channel-artifacts/config_update_in_envelope.pb -c $CHANNEL_NAME -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --tls --cafile $ORDERER_CA
# sleep 1

# # Chaincode Packaging and Installation for Org1
# echo "-------------Package and Install Chaincode for Org1-------------"

# cp -r ../fabric-samples/asset-transfer-basic/Gridlink ../Chaincode
# peer lifecycle chaincode package basic.tar.gz --pGridlink/ --lang node --label basic_1.0

# peer lifecycle chaincode install basic.tar.gz
# sleep 3
# peer lifecycle chaincode queryinstalled

# export CC_PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid basic.tar.gz)
# peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --channelID $CHANNEL_NAME --name basic --version 1.0 --package-id $CC_PACKAGE_ID --sequence 1 --tls --cafile $ORDERER_CA --waitForEvent
# sleep 1


echo "—---------------Commit chaincode in utilitycompany peer—-------------"

peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name Gridlink --version 1.0 --sequence 1 --collections-config ../Chaincode/gridlink/collection-gridlink.json --tls --cafile $ORDERER_CA --output json

peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --channelID $CHANNEL_NAME --name Gridlink --version 1.0 --sequence 1 --collections-config ../Chaincode/gridlink/collection-gridlink.json --tls --cafile $ORDERER_CA --peerAddresses localhost:7051 --tlsRootCertFiles $PRODUCER_PEER_TLSROOTCERT --peerAddresses localhost:9051 --tlsRootCertFiles $CONSUMER_PEER_TLSROOTCERT --peerAddresses localhost:11051 --tlsRootCertFiles $UTILITYCOMPANY_PEER_TLSROOTCERT --peerAddresses localhost:12051 --tlsRootCertFiles $REGULATORYBODY_PEER_TLSROOTCERT

sleep 1

# echo "-------------Commit the chaincode-------------"

# peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --channelID $CHANNEL_NAME --name basic --version 1.0 --sequence 1 --tls --cafile $ORDERER_CA --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/producer.gridlink.com/peers/peer0.producer.gridlink.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/consumer.gridlink.com/peers/peer0.consumer.gridlink.com/tls/ca.crt --peerAddresses localhost:11051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/utilitycompany.gridlink.com/peers/peer0.utilitycompany.gridlink.com/tls/ca.crt --peerAddresses localhost:12051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/regulatorybody.gridlink.com/peers/peer0.regulatorybody.gridlink.com/tls/ca.crt
# sleep 2

# peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name basic --cafile $ORDERER_CA


# peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name Gridlink --cafile $ORDERER_CApeer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --tls --cafile "${PWD}/organizations/ordererOrganizations/gridlink.com/orderers/orderer.gridlink.com/msp/tlscacerts/tlsca.gridlink.com-cert.pem" -C producer -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/producer.gridlink.com/peers/peer0.producer.gridlink.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/consumer.gridlink.com/peers/peer0.consumer.gridlink.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'

# peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.gridlink.com --tls --cafile "${PWD}/organizations/ordererOrganizations/gridlink.com/orderers/orderer.gridlink.com/msp/tlscacerts/tlsca.gridlink.com-cert.pem" -C Gridlinkchannel -n basic --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/producer.gridlink.com/peers/peer0.producer.gridlink.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/consumer.gridlink.com/peers/peer0.consumer.gridlink.com/tls/ca.crt" --peerAddresses localhost:11051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/utilitycompany.gridlink.com/peers/peer0.utilitycompany.gridlink.com/tls/ca.crt" --peerAddresses localhost:12051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/regulatorybody.gridlink.com/peers/peer0.regulatorybody.gridlink.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'
# peer chaincode query -C Gridlinkchannel -n basic -c '{"function":"ReadAsset","Args":["asset5"]}'