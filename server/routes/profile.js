let profile = {
    producer: {
        "cryptoPath": "../GridLink_NetWork_v1.0/organizations/peerOrganizations/producer.gridlink.com", 
		"keyDirectoryPath": "../GridLink_NetWork_v1.0/organizations/peerOrganizations/producer.gridlink.com/users/User1@producer.gridlink.com/msp/keystore/",
        "certPath":     "../GridLink_NetWork_v1.0/organizations/peerOrganizations/producer.gridlink.com/users/User1@producer.gridlink.com/msp/signcerts/cert.pem",
		"tlsCertPath":  "../GridLink_NetWork_v1.0/organizations/peerOrganizations/producer.gridlink.com/peers/peer0.producer.gridlink.com/tls/ca.crt",
		"peerEndpoint": "localhost:7051",
		"peerHostAlias":  "peer0.producer.gridlink.com",
        "mspId": "ProducerMSP"
        
    },
    consumer: {
        "cryptoPath": "../GridLink_NetWork_v1.0/organizations/peerOrganizations/consumer.gridlink.com", 
		"keyDirectoryPath": "../GridLink_NetWork_v1.0/organizations/peerOrganizations/consumer.gridlink.com/users/User1@consumer.gridlink.com/msp/keystore/",
        "certPath":     "../GridLink_NetWork_v1.0/organizations/peerOrganizations/consumer.gridlink.com/users/User1@consumer.gridlink.com/msp/signcerts/cert.pem",
		"tlsCertPath":  "../GridLink_NetWork_v1.0/organizations/peerOrganizations/consumer.gridlink.com/peers/peer0.consumer.gridlink.com/tls/ca.crt",
		"peerEndpoint": "localhost:9051",
		"peerHostAlias":  "peer0.consumer.gridlink.com",
        "mspId": "ConsumerMSP"
    },
    utilitycompany: {
        "cryptoPath": "../GridLink_NetWork_v1.0/organizations/peerOrganizations/utilitycompany.gridlink.com", 
		"keyDirectoryPath": "../GridLink_NetWork_v1.0/organizations/peerOrganizations/utilitycompany.gridlink.com/users/User1@utilitycompany.gridlink.com/msp/keystore/",
        "certPath":     "../GridLink_NetWork_v1.0/organizations/peerOrganizations/utilitycompany.gridlink.com/users/User1@utilitycompany.gridlink.com/msp/signcerts/cert.pem",
		"tlsCertPath":  "../GridLink_NetWork_v1.0/organizations/peerOrganizations/utilitycompany.gridlink.com/peers/peer0.utilitycompany.gridlink.com/tls/ca.crt",
		"peerEndpoint": "localhost:11051",
		"peerHostAlias":  "peer0.utilitycompany.gridlink.com",
        "mspId": "UtilityCompanyMSP"
    },
    regulatorybody: {
        "cryptoPath": "../GridLink_NetWork_v1.0/organizations/peerOrganizations/regulatorybody.gridlink.com", 
		"keyDirectoryPath": "../GridLink_NetWork_v1.0/organizations/peerOrganizations/regulatorybody.gridlink.com/users/User1@regulatorybody.gridlink.com/msp/keystore/",
        "certPath":     "../GridLink_NetWork_v1.0/organizations/peerOrganizations/regulatorybody.gridlink.com/users/User1@regulatorybody.gridlink.com/msp/signcerts/cert.pem",
		"tlsCertPath":  "../GridLink_NetWork_v1.0/organizations/peerOrganizations/regulatorybody.gridlink.com/peers/peer0.regulatorybody.gridlink.com/tls/ca.crt",
		"peerEndpoint": "localhost:11051",
		"peerHostAlias":  "peer0.regulatorybody.gridlink.com",
        "mspId": "RegulatoryBodyMSP"
    }
}
module.exports = { profile }
