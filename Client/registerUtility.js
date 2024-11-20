const { clientApplication } = require('./client');
let userClient = new clientApplication();

userClient.submitTxn(
    "utilitycompany",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "registerUtility",
    "",
    "registerUtility",
    "ut-01",         // producerId
    // "500",           // energy
         // pricePerKwh
).then(result => {
    console.log("Producer registered:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error registering producer:", error);
});
