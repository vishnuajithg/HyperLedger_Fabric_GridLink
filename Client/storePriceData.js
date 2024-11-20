const { clientApplication } = require('./client'); // Importing the client application

let userClient = new clientApplication(); // Instantiate the client

// Asynchronous function to call the storePriceData transaction
const transientData = {
    priceId: Buffer.from('pd-ut-01'),
    priceDetails: Buffer.from(JSON.stringify({ energyType: "solar", pricePerKwh: 0.12 }))
};


userClient.submitTxn(
    "producer",
    "gridlinkchannel",
    "Gridlink",
    "EnergyTradingContract",
    "storePriceData",
    transientData,
    "storePriceData",
    "pd-ut-01",
    "solar",
    
    
  
    

)

.then(result => {
    console.log("Energy request submitted:", new TextDecoder().decode(result));
})
.catch(error => {
    console.error("Error requesting energy:", error);
});
