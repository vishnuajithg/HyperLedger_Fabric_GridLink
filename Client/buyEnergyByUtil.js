const { clientApplication } = require('./client');
let userClient = new clientApplication();

userClient.submitTxn(
    "utilitycompany",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "buyEnergyByUtil",
    "",
    "buyEnergyByUtility",
    "pd-01",        // producerId
    "50"            // energyAmount
).then(result => {
    console.log("Energy bought by utility:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error buying energy:", error);
});
