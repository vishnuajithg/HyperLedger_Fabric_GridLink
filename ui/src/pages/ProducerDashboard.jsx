import React, { useState, useEffect } from "react";

function EnergyProductionDashboard() {
  const [totalEnergyProduced, setTotalEnergyProduced] = useState(0);
  const [pricePerKwh, setPricePerKwh] = useState(0.2);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [producerId, setProducerId] = useState("");
  const [energyAmount, setEnergyAmount] = useState("");
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [status, setStatus] = useState([]);
  const [approved, setApproved] = useState([]);
  const [newPrice, setNewPrice] = useState("");
  

  // Fetch pending requests (Rich Query)
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await fetch("/api/orders/pending");
        
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Data:", data);
  
          // Parse the result string into an array
          const parsedOrders = JSON.parse(data.result);
          setOrders(parsedOrders);
          
          // Log the orders after state update (this will show updated orders after re-render)
          console.log("Current orders state after update:", parsedOrders);
        } else {
          
          setMessage("Failed to fetch pending requests.");
        }
      } catch (error) {
        console.log("Error fetching data:", error);
        setMessage("An error occurred while fetching pending requests.");
      }
    };
  
    fetchPendingRequests();
  }, []);  // Empty dependency array so this runs once after the component mounts
  
  
  useEffect(() => {
    const fetchApprovedRequests = async () => {
      try {
        const response = await fetch("/api/orders/approved");
        
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Data:", data);
  
          // Parse the result string into an array
          const parsedOrders = JSON.parse(data.result);
          setApproved(parsedOrders);
          
          // Log the orders after state update (this will show updated orders after re-render)
          console.log("Current orders state after update:", parsedOrders);
        } else {
          
          setMessage("Failed to fetch pending requests.");
        }
      } catch (error) {
        console.log("Error fetching data:", error);
        setMessage("An error occurred while fetching pending requests.");
      }
    };
  
    fetchApprovedRequests();
  }, []);  // Empty dependency array so this runs once after the component mounts
  
  
  

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!producerId || !energyAmount || energyAmount <= 0) {
      setMessage("Please provide valid Producer ID and Energy Amount.");
      return;
    }

    try {
      const response = await fetch("/api/produceEnergy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producerId, energyAmount: parseFloat(energyAmount).toString() }),
      });

      const data = await response.json();
      if (response.ok) {
        setTotalEnergyProduced((prev) => prev + parseFloat(energyAmount));
        setTotalEarnings((prev) => prev + parseFloat(energyAmount) * pricePerKwh);
        setTransactions((prev) => [
          ...prev,
          { id: transactions.length + 1, producerId, energyAmount: parseFloat(energyAmount) },
        ]);
        setMessage(data.message);
      } else setMessage(data.message || "Failed to produce energy.");
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("An error occurred while producing energy.");
    }

    setProducerId("");
    setEnergyAmount("");
  }; 

  const handleApprove = async (requestId) => {
    try {
      const response = await fetch('/api/approveProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId }),
      });
      if (response.ok) {
        setStatus(prevStatus =>
          prevStatus.map(requeststatus =>
            requeststatus.requestId === requestId
              ? { ...requeststatus, status: 'Approved' }
              : requeststatus
          )
        );
      } else {
        console.error('Error approving product');
      }
    } catch (error) {
      console.error('Error approving product:', error);
    }
  };

  const handleSetPrice = async () => {
    const price = parseFloat(newPrice);
  
    if (price <= 0) {
      setMessage("Please enter a valid price.");
      setNewPrice("");
      return;
    }
  
    try {
      const response = await fetch('/api/utility/setPrice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pricePerKwh: price }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setPricePerKwh(price);
        setMessage(data.message || `Price per kWh updated to Rupee ${price.toFixed(2)}`);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Failed to update the price.");
      }
    } catch (error) {
      console.error("Error updating price:", error);
      setMessage("An error occurred while updating the price.");
    }
  
    setNewPrice("");
  };
  



  return (
    <div className="energy-production-dashboard font-sans p-8">
      <section className="header text-center mb-8">
        <h1 className="text-4xl font-bold">Energy Production Dashboard</h1>
        <p className="text-lg text-gray-600">Simulate energy production and track earnings in real-time.</p>
      </section>

      <section className="form mb-8 text-center">
        <form onSubmit={handleFormSubmit} className="bg-gray-100 p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <label htmlFor="producerId" className="block text-lg font-semibold mb-2">
              Producer ID:
            </label>
            <input
              id="producerId"
              type="text"
              value={producerId}
              onChange={(e) => setProducerId(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter Producer ID"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="energyAmount" className="block text-lg font-semibold mb-2">
              Energy Amount (kWh):
            </label>
            <input
              id="energyAmount"
              type="number"
              value={energyAmount}
              onChange={(e) => setEnergyAmount(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter Energy Amount"
              required
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg">
            Submit
          </button>
        </form>
        {message && <p className="text-sm text-gray-700 mt-4">{message}</p>}
      </section>

      <section className="dashboard bg-gray-100 p-6 rounded-lg mb-8">
        <div className="flex justify-around">
          <div className="stat bg-white shadow-lg p-4 rounded-lg w-1/3">
            <h3 className="text-lg font-semibold">Total Energy Produced</h3>
            <p className="text-2xl">{totalEnergyProduced} kWh</p>
          </div>
          <div className="stat bg-white shadow-lg p-4 rounded-lg w-1/3">
            <h3 className="text-lg font-semibold">Total Earnings</h3>
            <p className="text-2xl">Rupee {totalEarnings.toFixed(2)}</p>
          </div>
        </div>
      </section>

      <section className="sales bg-gray-100 p-6 rounded-lg">
  <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
  {orders && orders.length > 0 ? (
    <table className="table-auto w-full">
      <thead>
        <tr className="bg-gray-300">
          <th className="px-4 py-2">ID</th>
          <th className="px-4 py-2">Energy Amount (kWh)</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2">Approve</th>
        </tr>
      </thead>
      <tbody>
        {orders.filter(order => order.Record.requestId)
          .map((order) => (
            <tr key={order.Record.requestId} className="text-center">
              <td className="px-4 py-2">{order.Record.requesterId}</td>
              <td className="px-4 py-2">{order.Record.requestedEnergy}</td>
              <td className="px-4 py-2">{order.Record.status}</td>
              <td className="px-4 py-2 bg-green-500"><button onClick={() => handleApprove(order.Record.requestId)}>Approve</button></td>
            </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p className="text-center text-gray-600">No pending requests found.</p>
  )}
</section>


<section className="sales bg-gray-100 p-6 rounded-lg">
  <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
  {approved && approved.length > 0 ? (
    <table className="table-auto w-full">
      <thead>
        <tr className="bg-gray-300">
          <th className="px-4 py-2">ID</th>
          <th className="px-4 py-2">Energy Amount (kWh)</th>
          <th className="px-4 py-2">Status</th>
          {/* <th className="px-4 py-2">Approve</th> */}
        </tr>
      </thead>
      <tbody>
        {approved.filter(order => order.Record.requestId)
          .map((order) => (
            <tr key={order.Record.requestId} className="text-center">
              <td className="px-4 py-2">{order.Record.requesterId}</td>
              <td className="px-4 py-2">{order.Record.requestedEnergy}</td>
              <td className="px-4 py-2 bg-green-500">{order.Record.status}</td>
              {/* <td className="px-4 py-2 bg-green-500"><button onClick={() => handleApprove(order.Record.requestId)}>Approve</button></td> */}
            </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p className="text-center text-gray-600">No pending requests found.</p>
  )}
</section>

<section className="set-price bg-gray-100 p-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-4">Set Price for Utility Company</h2>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            placeholder="Enter price per kWh"
            className="p-2 border rounded-md w-1/2"
          />
          <button
            onClick={handleSetPrice}
            className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg"
          >
            Set Price
          </button>
        </div>
        {message && <p className="text-sm text-gray-700 mt-4">{message}</p>}
        <p className="mt-4 text-lg">
          Current Price per kWh: <span className="font-bold">Rupee {pricePerKwh.toFixed(2)}</span>
        </p>
      </section>
      {/* <section className="transactions bg-gray-100 p-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <table className="table-auto w-full">
          <thead>
            <tr className="bg-gray-300">
              <th className="px-4 py-2">Transaction ID</th>
              <th className="px-4 py-2">Producer ID</th>
              <th className="px-4 py-2">Energy Amount (kWh)</th>
            </tr>
          </thead>
          <tbody>
            {approved.map((txn) => (
              <tr key={txn.id} className="text-center">
                <td className="px-4 py-2">{txn.id}</td>
                <td className="px-4 py-2">{txn.producerId}</td>
                <td className="px-4 py-2">{txn.energyAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section> */}
    </div>
  );
}

export default EnergyProductionDashboard;
