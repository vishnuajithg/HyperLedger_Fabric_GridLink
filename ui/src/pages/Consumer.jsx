import React, { useState } from 'react';

// Mock data for initial received energy and transaction history
const initialTransactionHistory = [
  { id: 1, type: "Receive", amount: 30, timestamp: new Date().toLocaleString() },
  { id: 2, type: "Receive", amount: 20, timestamp: new Date().toLocaleString() },
];

function ConsumerDashboard() {
  const [totalReceivedEnergy, setTotalReceivedEnergy] = useState(50); // Initial total energy received
  const [requestedEnergy, setRequestedEnergy] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState(initialTransactionHistory);

  // Consumer registration form state
  const [consumerId, setConsumerId] = useState('');
  const [energyRequired, setEnergyRequired] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState('');

  console.log(consumerId,energyRequired)

  // Handle energy request
  const handleRequestEnergy = async () => {
    if (requestedEnergy <= 0) {
      alert("Please enter a positive amount to request.");
      return;
    }

    try {
      // Make API call to request energy
      const requesterId = consumerId
      console.log(consumerId,requestedEnergy)
      const response = await fetch('/api/requestEnergy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterId,           // Consumer ID
          role : "consumer",
          requestedEnergy     // Energy requested
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        // Add transaction to history
        setTransactionHistory((prev) => [
          ...prev,
          { id: Date.now(), type: "Request", amount: requestedEnergy, timestamp: new Date().toLocaleString() },
        ]);
        setTotalReceivedEnergy((prev) => prev + requestedEnergy); // Update total energy
        setRequestedEnergy(0); // Reset the requested energy
        alert("Energy request successful!");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error submitting energy request:", error);
      alert("An error occurred while processing your request.");
    }
  };

  // Handle consumer registration
  const handleConsumerRegistration = async (e) => {
    e.preventDefault();

    // Validation
    if (!consumerId || !energyRequired) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch('/api/registerConsumer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consumerId,
          energyRequired,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setRegistrationStatus(`Registration successful! Consumer ID: ${consumerId}`);
      } else {
        setRegistrationStatus(`Error: ${data.message}`);
      }
    } catch (error) {
      setRegistrationStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="consumer-dashboard font-sans p-8">
      <section className="header text-center mb-8">
        <h1 className="text-4xl font-bold">Consumer Dashboard</h1>
        <p className="text-lg text-gray-600">Monitor your energy consumption and request additional energy.</p>
      </section>

      {/* Consumer Registration Form */}
      <section className="consumer-registration bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">Consumer Registration</h2>
        <form onSubmit={handleConsumerRegistration} className="space-y-4">
          <div>
            <label className="block text-lg font-medium mb-2" htmlFor="consumerId">
              Consumer ID
            </label>
            <input
              type="text"
              id="consumerId"
              value={consumerId}
              onChange={(e) => setConsumerId(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              placeholder="Enter Consumer ID"
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-2" htmlFor="energyRequired">
              Energy Required (kWh)
            </label>
            <input
              type="number"
              id="energyRequired"
              value={energyRequired}
              onChange={(e) => setEnergyRequired(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              placeholder="Enter energy required"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Register Consumer
          </button>
        </form>

        {registrationStatus && <p className="mt-4">{registrationStatus}</p>}
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
            onClick={handleRequestEnergy}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Request
          </button>
        </div>
      </section>

      {/* Transaction History */}
      <section className="transaction-history bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="border-b-2 p-4">Type</th>
              <th className="border-b-2 p-4">Amount (kWh)</th>
              <th className="border-b-2 p-4">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {transactionHistory.map((transaction) => (
              <tr key={transaction.id}>
                <td className="border-b p-4">{transaction.type}</td>
                <td className="border-b p-4">{transaction.amount}</td>
                <td className="border-b p-4">{transaction.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default ConsumerDashboard;
