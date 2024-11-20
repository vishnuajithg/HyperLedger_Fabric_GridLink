const { clientApplication } = require('./client');
let userClient = new clientApplication();

userClient.submitTxn(
    "producer",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "produceEnergy",
    "",
    "produceEnergy",
    "pd-01",         // producerId
    "100"            // energyAmount
).then(result => {
    console.log("Energy produced:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error producing energy:", error);
});
