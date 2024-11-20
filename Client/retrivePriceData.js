const { clientApplication } = require('./client'); // Importing the client application

// Instantiate the client
let userClient = new clientApplication();

// Asynchronous function to call the `retrievePriceData` transaction
async function retrievePriceData(priceId) {
    try {
        // Submit the transaction
        const result = await userClient.submitTxn(
            "producer",                  // Identity to use for the transaction
            "gridlinkchannel",           // Channel name
            "Gridlink",                  // Chaincode name
            "EnergyTradingContract",     // Contract name
            "retrievePriceData",         // Function name
            "" ,
            "retrievePriceData" ,
            "pd-ut-01"                // Parameter: priceId
        );

        // Decode and parse the result
        const decodedResult = new TextDecoder().decode(result);
        console.log("Price data retrieved successfully:", JSON.parse(decodedResult));
    } catch (error) {
        console.error("Error retrieving price data:", error);
    }
}

// Call the function with a test price ID
retrievePriceData("pd-ut-01");
