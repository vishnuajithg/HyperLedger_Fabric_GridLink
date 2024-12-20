const { clientApplication } = require('./client')

let userClient = new clientApplication()
userClient.submitTxn(
    "dealer",
    "autochannel",
    "KBA-Automobile",
    "OrderContract",
    "queryTxn",
    "",
    "readOrder",
    "Order-09",
).then(result => {
        // Decode the Uint8Array to a string
        const decodedString = new TextDecoder().decode(result);
    
        // Parse the string as JSON
        const jsonObject = JSON.parse(decodedString);
        
        console.log("Order details:");
        // Log the JSON object
        console.log(jsonObject);
});
