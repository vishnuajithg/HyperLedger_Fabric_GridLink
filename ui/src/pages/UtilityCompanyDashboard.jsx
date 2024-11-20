import React, { useState } from 'react';

// Mock producers and consumers data
const initialProducers = [
  { id: 1, name: "Producer A", availableEnergy: 200 },
  { id: 2, name: "Producer B", availableEnergy: 150 },
];
const initialConsumers = [
  { id: 1, name: "Consumer X", requiredEnergy: 50 },
  { id: 2, name: "Consumer Y", requiredEnergy: 75 },
];

function UtilityCompanyDashboard() {
  const [totalDistributedEnergy, setTotalDistributedEnergy] = useState(0);
  const [totalReceivedEnergy, setTotalReceivedEnergy] = useState(0); // Total energy received
  const [requestedEnergy, setRequestedEnergy] = useState(0); // Current requested energy
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [availableEnergy, setAvailableEnergy] = useState(0);
  const [energyRequestStatus, setEnergyRequestStatus] = useState(""); // Track request status

  // Handle requesting energy
  const handleRequestEnergy = async (requestedEnergy) => {
    if (requestedEnergy <= 0) {
      alert("Requested energy must be greater than zero.");
      return;
    }

    // Find the producer that has enough energy available
    const producer = initialProducers.find(
      (p) => p.availableEnergy >= requestedEnergy
    );

    if (!producer) {
      setEnergyRequestStatus("No producer has enough energy available.");
      return;
    }

    try {
      // Simulate a backend request to process the energy request
      const response = await fetch("/api/requestEnergy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requesterId:'ut-01',           // Consumer ID
          role : "utilitycompany",
          requestedEnergy     // Energy requested
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the available energy and transaction history
        setAvailableEnergy((prev) => prev + requestedEnergy);
        setTotalReceivedEnergy((prev) => prev + requestedEnergy);
        setEnergyRequestStatus("Energy request submitted successfully.");

        setTransactionHistory((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "Request",
            from: "Producer",
            amount: requestedEnergy,
            producer: producer.name,
          },
        ]);
      } else {
        setEnergyRequestStatus(`Failed to request energy: ${data.message}`);
      }
    } catch (error) {
      console.error("Error requesting energy:", error);
      setEnergyRequestStatus("Failed to request energy due to an error.");
    }
  };

  return (
    <div className="utility-company-dashboard font-sans p-8">
      <section className="header text-center mb-8">
        <h1 className="text-4xl font-bold">Utility Company Dashboard</h1>
        <p className="text-lg text-gray-600">
          Manage energy buying, redistribution, and track transactions.
        </p>
      </section>

      {/* Energy Overview */}
      <section className="energy-overview bg-gray-100 p-6 rounded-lg mb-8 flex justify-around">
        <div className="stat bg-white shadow-lg p-4 rounded-lg w-1/2 text-center">
          <h3 className="text-lg font-semibold">Total Energy Received</h3>
          <p className="text-2xl">{totalReceivedEnergy} kWh</p>
        </div>
        <div className="stat bg-white shadow-lg p-4 rounded-lg w-1/2 text-center">
          <h3 className="text-lg font-semibold">Current Request</h3>
          <p className="text-2xl">{requestedEnergy} kWh</p>
        </div>
      </section>

      {/* Request Energy Section */}
      <section className="request-energy bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">Request Additional Energy</h2>
        <div className="flex items-center">
          <input
            type="number"
            value={requestedEnergy}
            onChange={(e) => setRequestedEnergy(Number(e.target.value))}
            placeholder="Enter amount in kWh"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full mr-4"
          />
          <button
            onClick={() => handleRequestEnergy(requestedEnergy)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Request
          </button>
        </div>
        {energyRequestStatus && <p className="mt-4 text-green-500">{energyRequestStatus}</p>}
      </section>

      {/* Redistribution Section */}
      <section className="redistribution bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">Redistribute Energy to Consumers</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="border-b-2 p-4">Consumer</th>
              <th className="border-b-2 p-4">Required Energy (kWh)</th>
              <th className="border-b-2 p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialConsumers.map((consumer) => (
              <tr key={consumer.id}>
                <td className="border-b p-4">{consumer.name}</td>
                <td className="border-b p-4">{consumer.requiredEnergy}</td>
                <td className="border-b p-4">
                  <button
                    onClick={() =>
                      handleRequestEnergy(consumer.requiredEnergy)
                    }
                    className="px-4 py-1 bg-green-500 text-white rounded-md"
                  >
                    Redistribute Energy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Transaction History */}
      <section className="transaction-history bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
        <ul>
          {transactionHistory.map((transaction) => (
            <li key={transaction.id} className="mb-2">
              <span className="font-semibold">{transaction.type}:</span> {transaction.amount} kWh
              {transaction.producer && ` (via ${transaction.producer})`}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default UtilityCompanyDashboard;
