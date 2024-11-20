// const express = require("express");
// const router = express.Router();
// const { clientApplication } = require('./client')

// router.post('/addProduct', async (req, res) => {
//   try {
//       const { name, category, quantity, price, owner } = req.body;
//       let FarmerClient = new clientApplication();

//       const result = await FarmerClient.submitTxn(
//           "farmer",
//           "harvest-channel",
//           "Harvest2home",
//           "HarvestContract",
//           "addproduct",
//           "",
//           "addProduct",
//           name,
//           category,
//           quantity,
//           price,
//           owner
//       );

//       console.log("Transaction result:", result);

//       res.status(201).json({
//           success: true,
//           message: "Product added successfully!",
//           data: result,
//       });
//   } catch (error) {
//       console.error('Error in adding product:', error);
//       res.status(500).json({
//           success: false,
//           message: "An error occurred while adding the product.",
//           error: error.message,
//       });
//   }
// });
// ﻿
// PaiGoMaNh
// paigomanh9708


const express = require("express");
const router = express.Router();
const { clientApplication } = require("./client"); // Assuming you have a client application setup for interacting with Fabric

// Initialize ledger
router.post("/initLedger", async (req, res) => {
    try {
        const FabricClient = new clientApplication();
        const result = await FabricClient.submitTxn(
            "admin",
            "energy-channel",
            "EnergyTrading",
            "EnergyTradingContract",
            "initLedger",
            ""
        );
        res.status(200).json({
            success: true,
            message: "Ledger initialized successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error initializing ledger:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initialize ledger",
            error: error.message,
        });
    }
});

// Register a producer
router.post("/registerProducer", async (req, res) => {
    const { producerId, energy, pricePerKwh } = req.body;
    try {
        const FabricClient = new clientApplication();
        const result = await FabricClient.submitTxn(
            "producer",
            "energy-channel",
            "EnergyTrading",
            "EnergyTradingContract",
            "registerProducer",
            producerId,
            energy,
            pricePerKwh
        );
        res.status(201).json({
            success: true,
            message: "Producer registered successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error registering producer:", error);
        res.status(500).json({
            success: false,
            message: "Failed to register producer",
            error: error.message,
        });
    }
});

// Register a consumer
router.post("/registerConsumer", async (req, res) => {
    const { consumerId, energyRequired } = req.body;
    try {
        const FabricClient = new clientApplication();
        const result = await FabricClient.submitTxn(
            "consumer",        // User role (can be consumer, utility, etc.)
            "gridlinkchannel",  // Channel name
            "Gridlink",         // Chaincode name
            "EnergyTradingContract",  // Contract name (this matches the chaincode's contract)
            "registerConsumer",         // Function to invoke in chaincode
            "",                 // Empty for this example
            "registerConsumer", // Function name in the chaincode        
            consumerId,
            energyRequired
        );
        res.status(201).json({
            success: true,
            message: "Consumer registered successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error registering consumer:", error);
        res.status(500).json({
            success: false,
            message: "Failed to register consumer",
            error: error.message,
        });
    }
});

// Produce energy
router.post("/produceEnergy", async (req, res) => {
    const { producerId, energyAmount } = req.body;
    try {
        const FabricClient = new clientApplication();
        const result = await FabricClient.submitTxn(
            "producer",
            "gridlinkchannel",
            "Gridlink",
            "EnergyTradingContract",
            "produceEnergy",
            "",
            "produceEnergy",
            producerId,
            energyAmount
        );
        res.status(200).json({
            success: true,
            message: "Energy production recorded successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error producing energy:", error);
        res.status(500).json({
            success: false,
            message: "Failed to produce energy",
            error: error.message,
        });
    }
});

// Request energy
router.post("/requestEnergy", async (req, res) => {
    const { requesterId, role, requestedEnergy } = req.body;
    console.log(requesterId, role, requestedEnergy )
    try {
        const FabricClient = new clientApplication();
        const result = await FabricClient.submitTxn(
            role,
            "gridlinkchannel",
            "Gridlink",
            "EnergyTradingContract",
            "requestEnergy",
            "",
            "requestEnergy",
            requesterId,
            role,
            requestedEnergy.toString()
        );
        res.status(200).json({
            success: true,
            message: "Energy request submitted successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error requesting energy:", error);
        res.status(500).json({
            success: false,
            message: "Failed to request energy",
            error: error.message,
        });
    }
});

router.get('/orders/pending', async (req, res) => {
    try {
      let FabricClient = new clientApplication();
  
        const result = await FabricClient.submitTxn(
            "producer",
            "gridlinkchannel",
            "Gridlink",
            "EnergyTradingContract",
            "queryAllOrders",
            "",
            "queryAllOrders",
        );
  
        // Send success response with the result
        res.status(200).send({ message: 'Audit details retrieved successfully', result: new TextDecoder().decode(result) });
    } catch (error) {
        console.error("Error invoking orders:", error);
        res.status(500).send({ error: 'Error during query' });
    }
  })
  router.get('/orders/approved', async (req, res) => {
    try {
      let FabricClient = new clientApplication();
  
        const result = await FabricClient.submitTxn(
            "producer",
            "gridlinkchannel",
            "Gridlink",
            "EnergyTradingContract",
            "queryAllOrdersApproved",
            "",
            "queryAllOrdersApproved",
        );
  
        // Send success response with the result
        res.status(200).send({ message: 'Audit details retrieved successfully', result: new TextDecoder().decode(result) });
    } catch (error) {
        console.error("Error invoking orders:", error);
        res.status(500).send({ error: 'Error during query' });
    }
  })
  router.post('/approveProduct', async (req, res) => {
    const { requestId } = req.body;

    try {
      let FabricClient = new clientApplication();
  
        const result = await FabricClient.submitTxn(
            "producer",
            "gridlinkchannel",
            "Gridlink",
            "EnergyTradingContract",
            "approveRequest",
            "",
            "approveRequest",
            requestId
        );
        res.status(200).json();
        // res.status(200).json({ message: 'Audit details retrieved successfully', result: new TextDecoder().decode(result) });
    } catch (error) {
        console.error("Error invoking request:", error);
        res.status(500).send({ error: 'Error during query' });
    }
  })


// Handle energy requests (approve/reject)
router.post("/handleEnergyRequest", async (req, res) => {
    const { requestId, action, approverId } = req.body;
    try {
        const FabricClient = new clientApplication();
        const result = await FabricClient.submitTxn(
            "approver",
            "energy-channel",
            "EnergyTrading",
            "EnergyTradingContract",
            "handleEnergyRequest",
            requestId,
            action,
            approverId
        );
        res.status(200).json({
            success: true,
            message: `Energy request ${action}ed successfully`,
            data: result,
        });
    } catch (error) {
        console.error("Error handling energy request:", error);
        res.status(500).json({
            success: false,
            message: `Failed to ${action} energy request`,
            error: error.message,
        });
    }
});

module.exports = router;
