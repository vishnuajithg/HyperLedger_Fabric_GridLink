const { clientApplication } = require('./client');
let userClient = new clientApplication();

// Submitting a transaction where a producer or utility approves a consumer's energy request
userClient.submitTxn(
    "utility",            // User role (can be producer, utility, etc.)
    "gridlinkchannel",    // Channel name
    "Gridlink",           // Chaincode name
    "EnergyTradingContract", // Contract name (this matches the chaincode's contract)
    "handleEnergyRequest",  // Function to invoke in chaincode
    "",                   // Empty for this example (optional, can be additional params)
    "handleEnergyRequest",  // Function name in the chaincode
    "02eb344889930db5a1f8563b5118e7de27692a4ae6924e6de10aa4a94603f44d", // requestId (unique identifier for the energy request)
    "approve",            // Action to be taken (approve/reject)
    "pd-01"         // approverId (can be a producer or utility who is approving the request)
).then(result => {
    console.log("Energy request handled:", new TextDecoder().decode(result));
}).catch(error => {
    console.error("Error handling energy request:", error);
});
