// const { clientApplication } = require('./client');

// let userClient = new clientApplication();
// userClient.submitTxn(
//     "utilitycompany",
//     "gridlinkchannel",
//     "Gridlink",
//     "EnergyTradingContract",
//     "invokeTxn",
//     "",
//     "buyEnergyByUtility",
//     "pd-01",
//     "0"
// ).then(result => {
//     console.log(new TextDecoder().decode(result))
//     console.log("bought energy successfully")
// })

const { clientApplication } = require('./client');
let userClient = new clientApplication();

// Initialize the ledger
userClient.submitTxn(
    "utilitycompany",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "invokeTxn",
    "",
    "initLedger"
).then(result => {
    console.log("Ledger initialized:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error initializing ledger:", error);
});

// Register a producer
userClient.submitTxn(
    "producer",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "invokeTxn",
    "",
    "registerProducer",
    "pd-01",         // producerId
    "500",           // energy
    "0.10"           // pricePerKwh
).then(result => {
    console.log("Producer registered:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error registering producer:", error);
});

// Register a consumer
userClient.submitTxn(
    "consumer",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "invokeTxn",
    "",
    "registerConsumer",
    "cn-01"          // consumerId
).then(result => {
    console.log("Consumer registered:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error registering consumer:", error);
});

// Register a utility company
userClient.submitTxn(
    "utilitycompany",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "invokeTxn",
    "",
    "registerUtility",
    "ut-01"          // utilityId
).then(result => {
    console.log("Utility company registered:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error registering utility company:", error);
});

// Produce energy by producer
userClient.submitTxn(
    "producer",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "invokeTxn",
    "",
    "createEnergy"
).then(result => {
    console.log("Energy created:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error producing energy:", error);
});

// Handle sale order by producer (approve/reject)
userClient.submitTxn(
    "producer",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "invokeTxn",
    "",
    "handleSaleOrder",
    "order-01",     // orderId
    "approve",      // action (approve/reject)
    "buyer-01",     // buyerName
    "100"           // energyAmount
).then(result => {
    console.log("Sale order handled:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error handling sale order:", error);
});

// Utility company buys energy from producer
userClient.submitTxn(
    "utilitycompany",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "invokeTxn",
    "",
    "buyEnergyByUtility",
    "pd-01",        // producerId
    "50"            // energyAmount
).then(result => {
    console.log("Energy bought by utility:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error buying energy:", error);
});
