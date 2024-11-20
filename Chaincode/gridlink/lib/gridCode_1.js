'use strict';

const { Contract } = require('fabric-contract-api');

class EnergyManagementContract extends Contract {

    // Producer Functions

    async createEnergyData(ctx, id, owner, energyInfo, dataType, timestamp) {
        const energyData = {
            id,
            owner,
            energyInfo,
            dataType,
            timestamp,
            docType: 'energyData'
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(energyData)));
        return JSON.stringify(energyData);
    }

    async updateEnergyStatus(ctx, id, statusInfo) {
        const energyDataAsBytes = await ctx.stub.getState(id);
        if (!energyDataAsBytes || energyDataAsBytes.length === 0) {
            throw new Error(`Energy data with ID ${id} does not exist`);
        }
        const energyData = JSON.parse(energyDataAsBytes.toString());
        energyData.statusInfo = statusInfo;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(energyData)));
        return JSON.stringify(energyData);
    }

    async scheduleMaintenance(ctx, id, maintenanceDate, expectedDuration) {
        const energyDataAsBytes = await ctx.stub.getState(id);
        if (!energyDataAsBytes || energyDataAsBytes.length === 0) {
            throw new Error(`Energy data with ID ${id} does not exist`);
        }
        const energyData = JSON.parse(energyDataAsBytes.toString());
        energyData.maintenanceDate = maintenanceDate;
        energyData.expectedDuration = expectedDuration;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(energyData)));
        return JSON.stringify(energyData);
    }

    async recordEmissionData(ctx, id, emissionDetails) {
        const energyDataAsBytes = await ctx.stub.getState(id);
        if (!energyDataAsBytes || energyDataAsBytes.length === 0) {
            throw new Error(`Energy data with ID ${id} does not exist`);
        }
        const energyData = JSON.parse(energyDataAsBytes.toString());
        energyData.emissionDetails = emissionDetails;
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(energyData)));
        return JSON.stringify(energyData);
    }

    async sellEnergyToUtility(ctx, id, quantity, price) {
        const energyDataAsBytes = await ctx.stub.getState(id);
        if (!energyDataAsBytes || energyDataAsBytes.length === 0) {
            throw new Error(`Energy data with ID ${id} does not exist`);
        }
        const energyData = JSON.parse(energyDataAsBytes.toString());
        energyData.saleDetails = { quantity, price };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(energyData)));
        return JSON.stringify(energyData);
    }

    // Utility Functions

    async distributeEnergy(ctx, producerId, consumerId, quantity, distributionDetails) {
        const producerDataAsBytes = await ctx.stub.getState(producerId);
        if (!producerDataAsBytes || producerDataAsBytes.length === 0) {
            throw new Error(`Producer data with ID ${producerId} does not exist`);
        }
        const producerData = JSON.parse(producerDataAsBytes.toString());

        if (producerData.energyInfo.available < quantity) {
            throw new Error(`Insufficient energy available for distribution`);
        }

        producerData.energyInfo.available -= quantity;
        await ctx.stub.putState(producerId, Buffer.from(JSON.stringify(producerData)));

        const consumptionRecord = {
            consumerId,
            quantity,
            timestamp: new Date().toISOString(),
            distributionDetails,
            docType: 'energyConsumption'
        };
        await ctx.stub.putState(`${consumerId}-${new Date().getTime()}`, Buffer.from(JSON.stringify(consumptionRecord)));
        
        return JSON.stringify(consumptionRecord);
    }

    async recordConsumptionData(ctx, consumerId, consumptionInfo) {
        const consumptionData = {
            consumerId,
            consumptionInfo,
            timestamp: new Date().toISOString(),
            docType: 'energyUsage'
        };
        await ctx.stub.putState(`${consumerId}-${new Date().getTime()}`, Buffer.from(JSON.stringify(consumptionData)));
        return JSON.stringify(consumptionData);
    }

    async updateDemandForecast(ctx, forecastDetails) {
        const forecastData = {
            forecastDetails,
            timestamp: new Date().toISOString(),
            docType: 'demandForecast'
        };
        await ctx.stub.putState(`forecast-${new Date().getTime()}`, Buffer.from(JSON.stringify(forecastData)));
        return JSON.stringify(forecastData);
    }

    async billConsumer(ctx, consumerId, amountDue, dueDate) {
        const billRecord = {
            consumerId,
            amountDue,
            dueDate,
            timestamp: new Date().toISOString(),
            docType: 'bill'
        };
        await ctx.stub.putState(`bill-${consumerId}-${new Date().getTime()}`, Buffer.from(JSON.stringify(billRecord)));
        return JSON.stringify(billRecord);
    }

    async applyDemandResponse(ctx, consumerId, adjustmentDetails) {
        const responseRecord = {
            consumerId,
            adjustmentDetails,
            timestamp: new Date().toISOString(),
            docType: 'demandResponse'
        };
        await ctx.stub.putState(`demandResponse-${consumerId}-${new Date().getTime()}`, Buffer.from(JSON.stringify(responseRecord)));
        return JSON.stringify(responseRecord);
    }

    async buyEnergyFromProducer(ctx, producerId, quantity, costDetails) {
        const producerDataAsBytes = await ctx.stub.getState(producerId);
        if (!producerDataAsBytes || producerDataAsBytes.length === 0) {
            throw new Error(`Producer data with ID ${producerId} does not exist`);
        }
        const producerData = JSON.parse(producerDataAsBytes.toString());

        producerData.energyInfo.available += quantity; 
        await ctx.stub.putState(producerId, Buffer.from(JSON.stringify(producerData)));

        const purchaseRecord = {
            producerId,
            quantity,
            costDetails,
            timestamp: new Date().toISOString(),
            docType: 'energyPurchase'
        };
        await ctx.stub.putState(`purchase-${producerId}-${new Date().getTime()}`, Buffer.from(JSON.stringify(purchaseRecord)));

        return JSON.stringify(purchaseRecord);
    }

// Consumer Functions

async viewUsageDetails(ctx, consumerId) {
    const usageQueryString = {
        selector: {
            docType: 'energyUsage',
            consumerId: consumerId
        }
    };
    const iterator = await ctx.stub.getQueryResult(JSON.stringify(usageQueryString));
    const results = [];
    while (true) {
        const res = await iterator.next();
        if (res.value && res.value.length !== 0) {
            results.push(JSON.parse(res.value.toString('utf8')));
        }
        if (res.done) {
            await iterator.close();
            break;
        }
    }
    return JSON.stringify(results);
}

async submitFeedback(ctx, consumerId, feedbackDetails) {
    const feedbackRecord = {
        consumerId,
        feedbackDetails,
        timestamp: new Date().toISOString(),
        docType: 'feedback'
    };
    await ctx.stub.putState(`feedback-${consumerId}-${new Date().getTime()}`, Buffer.from(JSON.stringify(feedbackRecord)));
    return JSON.stringify(feedbackRecord);
}

async requestDemandResponse(ctx, consumerId, adjustmentPreference) {
    const requestRecord = {
        consumerId,
        adjustmentPreference,
        timestamp: new Date().toISOString(),
        docType: 'demandResponseRequest'
    };
    await ctx.stub.putState(`demandResponseRequest-${consumerId}-${new Date().getTime()}`, Buffer.from(JSON.stringify(requestRecord)));
    return JSON.stringify(requestRecord);
}

async payBill(ctx, consumerId, paymentDetails) {
    const paymentRecord = {
        consumerId,
        paymentDetails,
        timestamp: new Date().toISOString(),
        docType: 'billPayment'
    };
    await ctx.stub.putState(`payment-${consumerId}-${new Date().getTime()}`, Buffer.from(JSON.stringify(paymentRecord)));
    return JSON.stringify(paymentRecord);
}

async generateUsageReport(ctx, consumerId, dateRange) {
    const report = {
        consumerId,
        dateRange,
        timestamp: new Date().toISOString(),
        docType: 'usageReport'
    };
    await ctx.stub.putState(`usageReport-${consumerId}-${new Date().getTime()}`, Buffer.from(JSON.stringify(report)));
    return JSON.stringify(report);
}


// Regulatory Functions

async verifyCompliance(ctx, orgId, complianceData) {
    const complianceRecord = {
        orgId,
        complianceData,
        timestamp: new Date().toISOString(),
        docType: 'complianceVerification'
    };
    await ctx.stub.putState(`compliance-${orgId}-${new Date().getTime()}`, Buffer.from(JSON.stringify(complianceRecord)));
    return JSON.stringify(complianceRecord);
}

async auditEmissionData(ctx, producerId, dateRange) {
    const emissionAuditQueryString = {
        selector: {
            docType: 'emissionData',
            producerId: producerId,
            timestamp: {
                $gte: dateRange.start,
                $lte: dateRange.end
            }
        }
    };
    const iterator = await ctx.stub.getQueryResult(JSON.stringify(emissionAuditQueryString));
    const results = [];
    while (true) {
        const res = await iterator.next();
        if (res.value && res.value.length !== 0) {
            results.push(JSON.parse(res.value.toString('utf8')));
        }
        if (res.done) {
            await iterator.close();
            break;
        }
    }
    return JSON.stringify(results);
}

async issuePenalty(ctx, orgId, violationDetails) {
    const penaltyRecord = {
        orgId,
        violationDetails,
        timestamp: new Date().toISOString(),
        docType: 'penalty'
    };
    await ctx.stub.putState(`penalty-${orgId}-${new Date().getTime()}`, Buffer.from(JSON.stringify(penaltyRecord)));
    return JSON.stringify(penaltyRecord);
}

async publishEnergyRates(ctx, rateInfo) {
    const ratesRecord = {
        rateInfo,
        timestamp: new Date().toISOString(),
        docType: 'energyRates'
    };
    await ctx.stub.putState(`energyRates-${new Date().getTime()}`, Buffer.from(JSON.stringify(ratesRecord)));
    return JSON.stringify(ratesRecord);
}

async grantRenewableIncentives(ctx, producerId, incentiveDetails) {
    const incentiveRecord = {
        producerId,
        incentiveDetails,
        timestamp: new Date().toISOString(),
        docType: 'renewableIncentives'
    };
    await ctx.stub.putState(`incentives-${producerId}-${new Date().getTime()}`, Buffer.from(JSON.stringify(incentiveRecord)));
    return JSON.stringify(incentiveRecord);
}


    // Rich Queries

    async queryEnergyDataByOwner(ctx, owner) {
        const queryString = {
            selector: {
                docType: 'energyData',
                owner: owner
            }
        };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.length !== 0) {
                results.push(JSON.parse(res.value.toString('utf8')));
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(results);
    }

    async queryAllEnergyData(ctx) {
        const queryString = {
            selector: {
                docType: 'energyData'
            }
        };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.length !== 0) {
                results.push(JSON.parse(res.value.toString('utf8')));
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(results);
    }

    async queryEnergyUsageByConsumer(ctx, consumerId) {
        const queryString = {
            selector: {
                docType: 'energyUsage',
                consumerId: consumerId
            }
        };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const results = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.length !== 0) {
                results.push(JSON.parse(res.value.toString('utf8')));
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }
        return JSON.stringify(results);
    }
}

createEnergyData( 'id', 'owner', 'energyInfo', 'dataType', 'timestamp')

module.exports = EnergyManagementContract;

