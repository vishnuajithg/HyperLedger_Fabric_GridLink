export FABRIC_CFG_PATH=./peercfg
export CHANNEL_NAME=gridlinkchannel 
export CORE_PEER_LOCALMSPID=ConsumerMSP
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_ADDRESS=localhost:9051 
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/consumer.gridlink.com/peers/peer0.consumer.gridlink.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/consumer.gridlink.com/users/Admin@consumer.gridlink.com/msp
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/gridlink.com/orderers/orderer.gridlink.com/msp/tlscacerts/tlsca.gridlink.com-cert.pem
export PRODUCER_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/producer.gridlink.com/peers/peer0.producer.gridlink.com/tls/ca.crt
export CONSUMER_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/consumer.gridlink.com/peers/peer0.consumer.gridlink.com/tls/ca.crt
export UTILITYCOMPANY_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/utilitycompany.gridlink.com/peers/peer0.utilitycompany.gridlink.com/tls/ca.crt
export REGULATORYBODY_PEER_TLSROOTCERT=${PWD}/organizations/peerOrganizations/regulatorybody.gridlink.com/peers/peer0.regulatorybody.gridlink.com/tls/ca.crt
