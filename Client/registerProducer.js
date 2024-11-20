const { clientApplication } = require('./client');
let userClient = new clientApplication();

userClient.submitTxn(
    "producer",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "registerProducer",
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
