'use strict';

const { Contract } = require('fabric-contract-api');

class EnergyTradingContract extends Contract {
  
  // Initialize ledger (optional)
  async initLedger(ctx) {
    console.info('Energy Trading Ledger Initialized');
  }

  async getCollectionName(ctx) {
    const collectionName = 'EnergyTradingCollection';
    return collectionName;
} 

  // Register a producer
  async registerProducer(ctx, producerId, energy, pricePerKwh) {
    const producer = {
      id: producerId,
      type: 'producer',
      energy: parseInt(energy),
      pricePerKwh: parseFloat(pricePerKwh),
    };
    await ctx.stub.putState(producerId, Buffer.from(JSON.stringify(producer)));
    return JSON.stringify(producer);
  }
  
  
  async registerConsumer(ctx, consumerId, energyRequired) {
  const consumer = {
    id: consumerId,
    type: 'consumer',
    energyRequired: parseInt(energyRequired),
  };

  // Store the consumer data in the ledger
  await ctx.stub.putState(consumerId, Buffer.from(JSON.stringify(consumer)));

  return JSON.stringify(consumer);
}

async registerUtility(ctx, utilityId) {
    const utilitycompany = {
      id: utilityId,
      type: 'utilitycompany',
    //   energyRequired: parseInt(energyRequired),
    };
  
    // Store the consumer data in the ledger
    await ctx.stub.putState(utilityId, Buffer.from(JSON.stringify(utilitycompany)));
  
    return JSON.stringify(utilitycompany);
  }

  async produceEnergy(ctx, producerId, energyAmount) {
    // Validate input
    if (!producerId || !energyAmount) {
        throw new Error('Producer ID and energy amount are required.');
    }

    const energyToProduce = parseInt(energyAmount);
    if (energyToProduce <= 0) {
        throw new Error('Energy amount must be a positive number.');
    }

    // Fetch producer details
    const producerAsBytes = await ctx.stub.getState(producerId);
    if (!producerAsBytes || producerAsBytes.length === 0) {
        throw new Error(`Producer with ID ${producerId} does not exist.`);
    }

    const producer = JSON.parse(producerAsBytes.toString());

    // Ensure the entity is a producer
    if (producer.type !== 'producer') {
        throw new Error(`Entity with ID ${producerId} is not a producer.`);
    }

    // Update the producer's total energy
    producer.energy = (producer.energy || 0) + energyToProduce;

    // Store updated producer details
    await ctx.stub.putState(producerId, Buffer.from(JSON.stringify(producer)));

    // Record the energy production as a transaction (optional)
    const transaction = {
        type: 'energy_production',
        producerId: producerId,
        energyProduced: energyToProduce,
        totalEnergy: producer.energy,
        // timestamp: new Date().toISOString(),
    };

    const transactionId = `transaction_${ctx.stub.getTxID()}`;
    await ctx.stub.putState(transactionId, Buffer.from(JSON.stringify(transaction)));

    return JSON.stringify({
        message: `Energy production recorded for producer ${producerId}`,
        energyProduced: energyToProduce,
        totalEnergy: producer.energy,
    });
}

async requestEnergy(ctx, requesterId, role, requestedEnergy) {
  // Validate inputs
  if (!requesterId || !role || !requestedEnergy) {
      throw new Error('Requester ID, role, and requested energy amount are required.');
  }

  const energyAmount = parseInt(requestedEnergy);
  if (energyAmount <= 0) {
      throw new Error('Requested energy must be greater than zero.');
  }

  // Check if the requester exists
  const requesterAsBytes = await ctx.stub.getState(requesterId);
  if (!requesterAsBytes || requesterAsBytes.length === 0) {
      throw new Error(`Requester with ID ${requesterId} does not exist.`);
  }

  const requester = JSON.parse(requesterAsBytes.toString());

  // Validate the role
  const validRoles = ['consumer', 'utilitycompany'];
  if (!validRoles.includes(role.toLowerCase())) {
      throw new Error(`Invalid role. Role must be one of: ${validRoles.join(', ')}.`);
  }

  // Create a request object
  const requestId = ctx.stub.getTxID(); // Unique request ID
  const energyRequest = {
      requestId,
      requesterId,
      role: role.toLowerCase(),
      requestedEnergy: energyAmount,
      status: 'Pending', // Initially pending
      // timestamp: new Date().toISOString(),
  };

  // Save the request to the ledger
  await ctx.stub.putState(
      requestId,
      Buffer.from(JSON.stringify(energyRequest))
  );

  return JSON.stringify({
      message: 'Energy request submitted successfully.',
      requestId,
  });
}

async approveRequest(ctx, requestId) {
    const energyRequest = JSON.parse((await ctx.stub.getState(requestId)).toString());
    energyRequest.status = 'Approved';
    await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(energyRequest)));

}


async handleEnergyRequest(ctx, requestId, action, approverId) {
  // Validate input
  if (!requestId || !action || !approverId) {
      throw new Error('Request ID, action (approve/reject), and approver ID are required.');
  }

  action = action.toLowerCase();
  if (!['approve', 'reject'].includes(action)) {
      throw new Error("Action must be 'approve' or 'reject'.");
  }

  // Fetch the energy request
  const requestAsBytes = await ctx.stub.getState(requestId);
  if (!requestAsBytes || requestAsBytes.length === 0) {
      throw new Error(`Energy request with ID ${requestId} does not exist.`);
  }

  const energyRequest = JSON.parse(requestAsBytes.toString());

  // Ensure request is still pending
  if (energyRequest.status !== 'Pending') {
      throw new Error(`Energy request with ID ${requestId} is already ${energyRequest.status}.`);
  }

  // Fetch the requester (consumer) data
  const requesterAsBytes = await ctx.stub.getState(energyRequest.requesterId);
  if (!requesterAsBytes || requesterAsBytes.length === 0) {
      throw new Error(`Requester with ID ${energyRequest.requesterId} does not exist.`);
  }

  const requester = JSON.parse(requesterAsBytes.toString());

  // Fetch the approver (producer or utilitycompany) data
  const approverAsBytes = await ctx.stub.getState(approverId);
  if (!approverAsBytes || approverAsBytes.length === 0) {
      throw new Error(`Approver with ID ${approverId} does not exist.`);
  }

  const approver = JSON.parse(approverAsBytes.toString());

  // Check if approver is either producer or utilitycompany
  if (approver.role !== 'producer' && approver.role !== 'utilitycompany') {
      throw new Error('Only producers or utilitycompany companies can approve/reject energy requests.');
  }

  if (action === 'approve') {
      // If the approver is a producer, deduct energy from the producer’s total energy
      if (approver.role === 'producer') {
          if (approver.totalEnergy < energyRequest.requestedEnergy) {
              throw new Error('Producer does not have enough energy to fulfill the request.');
          }
          approver.totalEnergy -= energyRequest.requestedEnergy;
          // Update the producer's total energy
          await ctx.stub.putState(approverId, Buffer.from(JSON.stringify(approver)));
      }
      // If the approver is a utilitycompany, deduct energy from the utility’s total energy
      else if (approver.role === 'utilitycompany') {
          if (approver.totalEnergy < energyRequest.requestedEnergy) {
              throw new Error('Utility does not have enough energy to fulfill the request.');
          }
          approver.totalEnergy -= energyRequest.requestedEnergy;
          // Update the utilitycompany's total energy
          await ctx.stub.putState(approverId, Buffer.from(JSON.stringify(approver)));
      }

      // Update the request status to 'Approved'
      energyRequest.status = 'Approved';
  } else {
      // Reject the request
      energyRequest.status = 'Rejected';
  }

  // Save the updated energy request
  await ctx.stub.putState(requestId, Buffer.from(JSON.stringify(energyRequest)));

  return JSON.stringify({
      message: `Energy request ${action}ed successfully.`,
      requestId,
      status: energyRequest.status,
  });
}


async queryAllOrders(ctx) {
    const queryString = {
        selector: {
            status: 'Pending'
        }
    };

    let resultIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
    let result = await this._getAllResults(resultIterator);
    return JSON.stringify(result);
}

async queryAllOrdersApproved(ctx) {
    const queryString = {
        selector: {
            status: 'Approved'
        }
    };

    let resultIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
    let result = await this._getAllResults(resultIterator);
    return JSON.stringify(result);
}


async _getAllResults(iterator, isHistory) {
    const allResults = [];

    let res = await iterator.next();
    while (!res.done) {
        if (res.value && res.value.value.toString()) {
            const jsonRes = {};
            if (isHistory) {
                jsonRes.TxId = res.value.txId;
                jsonRes.Timestamp = res.value.timestamp;
                jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
            } else {
                jsonRes.Key = res.value.key;
                jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
            }
            allResults.push(jsonRes);
        }
        res = await iterator.next();
    }
    await iterator.close();
    return allResults;
}

async storePriceData(ctx, priceId, priceDetails) {
    const collectionName = await this.getCollectionName(ctx); // Retrieve the collection name
    const priceData = {
        id: priceId,
        details: priceDetails, // Example: `{ energyType: "solar", pricePerKwh: 0.12 }`
    };

    // Save to the private data collection
    await ctx.stub.putPrivateData(collectionName, priceId, Buffer.from(JSON.stringify(priceData)));

    return JSON.stringify({
        message: 'Price data stored successfully in PDC.',
        priceId,
    });
}

async retrievePriceData(ctx, priceId) {
    const collectionName = await this.getCollectionName(ctx); // Retrieve the collection name

    // Get price data from the private data collection
    const priceDataAsBytes = await ctx.stub.getPrivateData(collectionName, priceId);

    if (!priceDataAsBytes || priceDataAsBytes.length === 0) {
        throw new Error(`Price data with ID ${priceId} does not exist in PDC.`);
    }

    const priceData = JSON.parse(priceDataAsBytes.toString());

    return JSON.stringify({
        message: 'Price data retrieved successfully from PDC.',
        priceData,
    });
}



//   // Register a consumer
//   async registerConsumer(ctx, consumerId) {
//     const consumer = {
//       id: consumerId,
//       type: 'consumer',
//       energy: 0, // Consumers start with 0 energy
//     };
//     await ctx.stub.putState(consumerId, Buffer.from(JSON.stringify(consumer)));
//     return JSON.stringify(consumer);
//   }

//   // Register a utilitycompany company
//   async registerUtility(ctx, utilityId) {
//     const utilitycompany = {
//       id: utilityId,
//       type: 'utilitycompany',
//       energy: 0, // Utility companies start with 0 energy
//     };
//     await ctx.stub.putState(utilityId, Buffer.from(JSON.stringify(utilitycompany)));
//     return JSON.stringify(utilitycompany);
//   }


//   async createEnergy(ctx) {
//     const producerId = ctx.clientIdentity.getID();
//     const entityAsBytes = await ctx.stub.getState(producerId);
    
//     if (!entityAsBytes || entityAsBytes.length === 0) {
//       throw new Error(`Producer ${producerId} does not exist`);
//     }

//     const entity = JSON.parse(entityAsBytes.toString());
//     if (entity.type !== 'producer') {
//       throw new Error(`Entity ${producerId} is not authorized to produce energy`);
//     }

//     // Generate a random energy amount (for example, between 1 and 100 units)
//     const randomEnergy = Math.floor(Math.random() * 100) + 1;

//     // Update the total energy produced
//     entity.totalEnergyProduced = (entity.totalEnergyProduced || 0) + randomEnergy;

//     // Save the updated entity back to the ledger
//     await ctx.stub.putState(producerId, Buffer.from(JSON.stringify(entity)));

//     // Record the energy production as a transaction
//     const transaction = {
//       type: 'energy_production',
//       entityId: producerId,
//       energyProduced: randomEnergy,
//       newTotalEnergyProduced: entity.totalEnergyProduced,
//       timestamp: new Date(),
//     };
//     await ctx.stub.putState(`transaction_${ctx.stub.getTxID()}`, Buffer.from(JSON.stringify(transaction)));

//     return JSON.stringify(transaction);
//   }

//   // 2. Handle Sale Order Approval or Rejection
//   async handleSaleOrder(ctx, orderId, action, buyerName, energyAmount) {
//     const orderAsBytes = await ctx.stub.getState(orderId);
//     if (!orderAsBytes || orderAsBytes.length === 0) {
//       throw new Error(`Order ${orderId} does not exist`);
//     }

//     const saleOrder = JSON.parse(orderAsBytes.toString());
//     const producerId = ctx.clientIdentity.getID();

//     if (saleOrder.producerId !== producerId) {
//       throw new Error(`Producer ${producerId} is not authorized to process this order`);
//     }

//     if (saleOrder.status !== 'pending') {
//       throw new Error(`Order ${orderId} has already been processed`);
//     }

//     // Update order based on action
//     saleOrder.buyerName = buyerName;
//     saleOrder.energyAmount = energyAmount;
//     if (action === 'approve') {
//       saleOrder.status = 'approved';
//       saleOrder.approvalTimestamp = new Date();
//     } else if (action === 'reject') {
//       saleOrder.status = 'rejected';
//       saleOrder.rejectionTimestamp = new Date();
//     } else {
//       throw new Error(`Invalid action: ${action}. Expected 'approve' or 'reject'`);
//     }

//     await ctx.stub.putState(orderId, Buffer.from(JSON.stringify(saleOrder)));
//     return JSON.stringify(saleOrder);
//   }

//   async buyEnergyByUtility(ctx, producerId, energyAmount) {
//     const consumerId = ctx.clientIdentity.getID();
//     const energyToBuy = parseInt(energyAmount);

//     // Fetch producer details
//     const producerAsBytes = await ctx.stub.getState(producerId);
//     if (!producerAsBytes || producerAsBytes.length === 0) {
//       throw new Error(`Producer ${producerId} does not exist`);
//     }

//     const producer = JSON.parse(producerAsBytes.toString());

//     // Verify that the entity is a producer
//     // if (producer.type !== 'producer') {
//     //   throw new Error(`Entity ${producerId} is not a valid energy producer`);
//     // }

//     // // Check if the producer has enough energy
//     // if (producer.energy < energyToBuy) {
//     //   throw new Error(`Producer ${producerId} does not have enough energy to fulfill this order`);
//     // }

//     // Deduct the energy from producer's balance
//     producer.energy -= energyToBuy;

//     // Save the updated producer state
//     await ctx.stub.putState(producerId, Buffer.from(JSON.stringify(producer)));

//     // Record the purchase as a transaction
//     const transactionId = `transaction_${ctx.stub.getTxID()}`;
//     const transaction = {
//       transactionId: transactionId,
//       producerId: producerId,
//       consumerId: consumerId,
//       energyAmount: energyToBuy,
//       status: 'completed',
//       // timestamp: new Date(),
//     };

//     // Save the transaction to the ledger
//     await ctx.stub.putState(transactionId, Buffer.from(JSON.stringify(transaction)));

//     return JSON.stringify(transaction);
//   }

//   // Function to Create Energy by Producers
//   // async createEnergy(ctx, amount) {
//   //   const producerId = ctx.clientIdentity.getID();
//   //   const energyProduced = parseInt(amount);

//   //   // Fetch producer details
//   //   const producerAsBytes = await ctx.stub.getState(producerId);
//   //   if (!producerAsBytes || producerAsBytes.length === 0) {
//   //     throw new Error(`Producer ${producerId} does not exist`);
//   //   }

//   //   const producer = JSON.parse(producerAsBytes.toString());

//   //   // Verify that the entity is a producer
//   //   if (producer.type !== 'producer') {
//   //     throw new Error(`Entity ${producerId} is not authorized to produce energy`);
//   //   }

//   //   // Add produced energy to the producer's balance
//   //   producer.energy += energyProduced;

//   //   // Save updated producer state back to the ledger
//   //   await ctx.stub.putState(producerId, Buffer.from(JSON.stringify(producer)));

//   //   return JSON.stringify({
//   //     producerId: producerId,
//   //     newEnergyBalance: producer.energy,
//   //   });
//   // }

//   async redistributeEnergy(ctx, consumerId, energyAmount) {
//     const energyToDistribute = parseInt(energyAmount);

//     // Fetch the current user's details (Producer or Utility)
//     const producerUtilityAsBytes = await ctx.stub.getState(ctx.clientIdentity.getID());
//     if (!producerUtilityAsBytes || producerUtilityAsBytes.length === 0) {
//       throw new Error(`The producer/utilitycompany entity ${ctx.clientIdentity.getID()} does not exist`);
//     }

//     const producerUtility = JSON.parse(producerUtilityAsBytes.toString());

//     // Verify that the entity (Producer or Utility) has enough energy to redistribute
//     if (producerUtility.energy < energyToDistribute) {
//       throw new Error(`Insufficient energy available for redistribution`);
//     }

//     // Fetch consumer details
//     const consumerAsBytes = await ctx.stub.getState(consumerId);
//     if (!consumerAsBytes || consumerAsBytes.length === 0) {
//       throw new Error(`Consumer ${consumerId} does not exist`);
//     }

//     const consumer = JSON.parse(consumerAsBytes.toString());

//     // Deduct energy from producer/utilitycompany's balance and add it to the consumer's balance
//     producerUtility.energy -= energyToDistribute;
//     consumer.energy = (consumer.energy || 0) + energyToDistribute;  // Increment consumer's energy

//     // Save the updated producer/utilitycompany and consumer states back to the ledger
//     await ctx.stub.putState(ctx.clientIdentity.getID(), Buffer.from(JSON.stringify(producerUtility)));
//     await ctx.stub.putState(consumerId, Buffer.from(JSON.stringify(consumer)));

//     // Record the redistribution as a transaction
//     const transactionId = `transaction_${ctx.stub.getTxID()}`;
//     const transaction = {
//       transactionId: transactionId,
//       producerUtilityId: ctx.clientIdentity.getID(),
//       consumerId: consumerId,
//       energyAmount: energyToDistribute,
//       status: 'redistributed',
//       timestamp: new Date(),
//     };

//     // Save the transaction to the ledger
//     await ctx.stub.putState(transactionId, Buffer.from(JSON.stringify(transaction)));

//     return JSON.stringify(transaction);
//   }

//   async buyEnergyByConsumer(ctx, sellerId, energyAmount) {
//     const energyToBuy = parseInt(energyAmount);

//     // Fetch consumer details (buyer)
//     const consumerAsBytes = await ctx.stub.getState(ctx.clientIdentity.getID());
//     if (!consumerAsBytes || consumerAsBytes.length === 0) {
//       throw new Error(`Consumer ${ctx.clientIdentity.getID()} does not exist`);
//     }

//     const consumer = JSON.parse(consumerAsBytes.toString());

//     // Check if the consumer has enough balance to buy energy (assuming some kind of balance exists)
//     if (consumer.balance < energyToBuy) {
//       throw new Error(`Consumer ${ctx.clientIdentity.getID()} does not have enough balance to buy energy`);
//     }

//     // Fetch seller details (producer or utilitycompany consumer)
//     const sellerAsBytes = await ctx.stub.getState(sellerId);
//     if (!sellerAsBytes || sellerAsBytes.length === 0) {
//       throw new Error(`Seller ${sellerId} does not exist`);
//     }

//     const seller = JSON.parse(sellerAsBytes.toString());

//     // Ensure that the seller is a valid entity that can sell energy (producer or utilitycompany)
//     if (seller.type !== 'producer' && seller.type !== 'utilitycompany') {
//       throw new Error(`Seller ${sellerId} is not authorized to sell energy`);
//     }

//     // Check if the seller has enough energy to sell
//     if (seller.energy < energyToBuy) {
//       throw new Error(`Seller ${sellerId} does not have enough energy to sell`);
//     }

//     // Perform the energy transfer: Deduct from seller, add to consumer
//     consumer.balance -= energyToBuy;   // Deduct energy cost from consumer's balance (could be in credits or tokens)
//     seller.energy -= energyToBuy;      // Deduct energy from seller's available energy
//     consumer.energy = (consumer.energy || 0) + energyToBuy; // Add energy to consumer's energy balance

//     // Save updated consumer and seller states back to the ledger
//     await ctx.stub.putState(ctx.clientIdentity.getID(), Buffer.from(JSON.stringify(consumer)));
//     await ctx.stub.putState(sellerId, Buffer.from(JSON.stringify(seller)));

//     // Record the energy purchase as a transaction
//     const transactionId = `transaction_${ctx.stub.getTxID()}`;
//     const transaction = {
//       transactionId: transactionId,
//       buyerId: ctx.clientIdentity.getID(),
//       sellerId: sellerId,
//       energyAmount: energyToBuy,
//       status: 'completed',
//       timestamp: new Date(),
//     };

//     // Save the transaction to the ledger
//     await ctx.stub.putState(transactionId, Buffer.from(JSON.stringify(transaction)));

//     return JSON.stringify(transaction);
//   }





























// //   // Producer sells energy to a utilitycompany company
// //   async sellEnergyFromProducer(ctx, producerId, utilityId, amount) {
// //     const producerAsBytes = await ctx.stub.getState(producerId);
// //     const utilityAsBytes = await ctx.stub.getState(utilityId);

// //     if (!producerAsBytes || producerAsBytes.length === 0) {
// //       throw new Error(`Producer ${producerId} does not exist`);
// //     }
// //     if (!utilityAsBytes || utilityAsBytes.length === 0) {
// //       throw new Error(`Utility ${utilityId} does not exist`);
// //     }

// //     const producer = JSON.parse(producerAsBytes.toString());
// //     const utilitycompany = JSON.parse(utilityAsBytes.toString());

// //     if (producer.energy < amount) {
// //       throw new Error(`Producer ${producerId} has insufficient energy`);
// //     }

// //     const cost = amount * producer.pricePerKwh;
// //     producer.energy -= amount;
// //     utilitycompany.energy += amount;

// //     await ctx.stub.putState(producerId, Buffer.from(JSON.stringify(producer)));
// //     await ctx.stub.putState(utilityId, Buffer.from(JSON.stringify(utilitycompany)));

// //     const transaction = {
// //       type: 'sell',
// //       from: producerId,
// //       to: utilityId,
// //       amount,
// //       cost,
// //       timestamp: new Date(),
// //     };
// //     await ctx.stub.putState(`transaction_${ctx.stub.getTxID()}`, Buffer.from(JSON.stringify(transaction)));
// //     return JSON.stringify(transaction);
// //   }

// //   // Utility company sells energy to a consumer
// //   async sellEnergyFromUtility(ctx, utilityId, consumerId, amount, pricePerKwh) {
// //     const utilityAsBytes = await ctx.stub.getState(utilityId);
// //     const consumerAsBytes = await ctx.stub.getState(consumerId);

// //     if (!utilityAsBytes || utilityAsBytes.length === 0) {
// //       throw new Error(`Utility ${utilityId} does not exist`);
// //     }
// //     if (!consumerAsBytes || consumerAsBytes.length === 0) {
// //       throw new Error(`Consumer ${consumerId} does not exist`);
// //     }

// //     const utilitycompany = JSON.parse(utilityAsBytes.toString());
// //     const consumer = JSON.parse(consumerAsBytes.toString());

// //     if (utilitycompany.energy < amount) {
// //       throw new Error(`Utility ${utilityId} has insufficient energy`);
// //     }

// //     const cost = amount * pricePerKwh;
// //     utilitycompany.energy -= amount;
// //     consumer.energy += amount;

// //     await ctx.stub.putState(utilityId, Buffer.from(JSON.stringify(utilitycompany)));
// //     await ctx.stub.putState(consumerId, Buffer.from(JSON.stringify(consumer)));

// //     const transaction = {
// //       type: 'sell',
// //       from: utilityId,
// //       to: consumerId,
// //       amount,
// //       cost,
// //       timestamp: new Date(),
// //     };
// //     await ctx.stub.putState(`transaction_${ctx.stub.getTxID()}`, Buffer.from(JSON.stringify(transaction)));
// //     return JSON.stringify(transaction);
// //   }

// //   // Create energy for producers or utilitycompany companies
// //   async createEnergy(ctx, entityId, amount) {
// //     const entityAsBytes = await ctx.stub.getState(entityId);

// //     if (!entityAsBytes || entityAsBytes.length === 0) {
// //       throw new Error(`Entity ${entityId} does not exist`);
// //     }

// //     const entity = JSON.parse(entityAsBytes.toString());

// //     // Only producers and utilitycompany companies are allowed to create energy
// //     if (entity.type !== 'producer' && entity.type !== 'utilitycompany') {
// //       throw new Error(`Entity ${entityId} is not authorized to create energy`);
// //     }

// //     // Update the energy balance of the entity
// //     entity.energy += parseInt(amount);

// //     // Save updated entity back to the ledger
// //     await ctx.stub.putState(entityId, Buffer.from(JSON.stringify(entity)));

// //     // Record the energy creation as a transaction
// //     const transaction = {
// //       type: 'create',
// //       entityId: entityId,
// //       amount,
// //       timestamp: new Date(),
// //     };
// //     await ctx.stub.putState(`transaction_${ctx.stub.getTxID()}`, Buffer.from(JSON.stringify(transaction)));

// //     return JSON.stringify(transaction);
// //   }

// //   // Buy energy from a producer or utilitycompany
// //   async buyEnergy(ctx, buyerId, sellerId, amount) {
// //     const buyerAsBytes = await ctx.stub.getState(buyerId);
// //     const sellerAsBytes = await ctx.stub.getState(sellerId);

// //     if (!buyerAsBytes || buyerAsBytes.length === 0) {
// //       throw new Error(`Buyer ${buyerId} does not exist`);
// //     }
// //     if (!sellerAsBytes || sellerAsBytes.length === 0) {
// //       throw new Error(`Seller ${sellerId} does not exist`);
// //     }

// //     const buyer = JSON.parse(buyerAsBytes.toString());
// //     const seller = JSON.parse(sellerAsBytes.toString());

// //     if (seller.energy < amount) {
// //       throw new Error(`Seller ${sellerId} has insufficient energy`);
// //     }

// //     const pricePerKwh = seller.type === 'producer' ? seller.pricePerKwh : 0.20;  // Set price based on seller type
// //     const cost = amount * pricePerKwh;
// //     seller.energy -= amount;
// //     buyer.energy += amount;

// //     await ctx.stub.putState(sellerId, Buffer.from(JSON.stringify(seller)));
// //     await ctx.stub.putState(buyerId, Buffer.from(JSON.stringify(buyer)));

// //     const transaction = {
// //       type: 'buy',
// //       from: sellerId,
// //       to: buyerId,
// //       amount,
// //       cost,
// //       timestamp: new Date(),
// //     };
// //     await ctx.stub.putState(`transaction_${ctx.stub.getTxID()}`, Buffer.from(JSON.stringify(transaction)));
// //     return JSON.stringify(transaction);
// //   }

// //   // Retrieve transaction history by transaction ID
// //   async getTransaction(ctx, txId) {
// //     const transactionAsBytes = await ctx.stub.getState(txId);
// //     if (!transactionAsBytes || transactionAsBytes.length === 0) {
// //       throw new Error(`Transaction ${txId} does not exist`);
// //     }
// //     return transactionAsBytes.toString();
// //   }

// //   // Get details of any user (producer, consumer, utilitycompany) by ID
// //   async getUser(ctx, userId) {
// //     const userAsBytes = await ctx.stub.getState(userId);
// //     if (!userAsBytes || userAsBytes.length === 0) {
// //       throw new Error(`User ${userId} does not exist`);
// //     }
// //     return userAsBytes.toString();
// //   }
}

module.exports = EnergyTradingContract;
