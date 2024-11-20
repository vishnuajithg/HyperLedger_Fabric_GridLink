const { clientApplication } = require('./client');
let userClient = new clientApplication();

userClient.submitTxn(
    "consumer",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "requestEnergy",
    "",
    "requestEnergy",
    "consumer-01",  // requesterId
    "consumer",     // role
    "200"           // requestedEnergy
).then(result => {
    console.log("Energy request submitted:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error requesting energy:", error);
});
