import { useState } from 'react';
import Homepage from './pages/Homepage';
import PD from './pages/ProducerDashboard';
import UC from './pages/UtilityCompanyDashboard';
import ConsumerDashboard from './pages/Consumer';
// import TestPage from './pages/TestPage'; // Importing TestPage
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/producer" element={<PD />} />
          <Route path="/utilityCompany" element={<UC />} />
          <Route path="/consumer" element={<ConsumerDashboard />} />

          {/* Test Routes */}
          {/* <Route path="/test" element={<TestPage />} /> */}
          <Route path="/test/producer" element={<h1>Producer Test Page</h1>} />
          <Route path="/test/utility" element={<h1>Utility Company Test Page</h1>} />
          <Route path="/test/consumer" element={<h1>Consumer Test Page</h1>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

