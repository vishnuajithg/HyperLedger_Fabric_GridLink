const { clientApplication } = require('./client');
let userClient = new clientApplication();

userClient.submitTxn(
    "consumer",        // User role (can be consumer, utility, etc.)
    "gridlinkchannel",  // Channel name
    "Gridlink",         // Chaincode name
    "EnergyTradingContract",  // Contract name (this matches the chaincode's contract)
    "registerConsumer",         // Function to invoke in chaincode
    "",                 // Empty for this example
    "registerConsumer", // Function name in the chaincode
    "consumer-01",      // consumerId
    "300"               // energyRequired (this can be a required energy amount for the consumer)
).then(result => {
    console.log("Consumer registered:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error registering consumer:", error);
});
