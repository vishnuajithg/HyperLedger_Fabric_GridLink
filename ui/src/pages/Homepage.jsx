import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="landing-page font-sans">
      {/* Hero Section */}
      <section className="hero bg-gradient-to-r from-blue-500 to-green-500 text-white py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">PowerGrid Energy Platform</h1>
        <p className="text-xl mb-8">
          Empowering decentralized energy trading between users, producers, and utility companies.
        </p>
        <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-md shadow-md">
          Get Started
        
        </button>
        <Link to='/producer'>
        <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-md shadow-md">
          Producer Dashboard
        </button>
        </Link>

        <Link to='/utilityCompany'>
        <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-md shadow-md">
         Utility Company
        </button>
        </Link>
        <Link to='/consumer'>
        <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-md shadow-md">
         Consumer
        </button>
        </Link>
      </section>

      {/* Features Section */}
      <section className="features py-16 bg-gray-100 text-center">
        <h2 className="text-3xl font-bold mb-8">Key Features</h2>
        <div className="flex flex-wrap justify-around">
          <div className="feature-card bg-white p-6 shadow-lg rounded-lg w-80 m-4">
            <h3 className="text-xl font-semibold mb-4">Energy Trading</h3>
            <p>Buy and sell energy directly from others on a secure blockchain network.</p>
          </div>
          <div className="feature-card bg-white p-6 shadow-lg rounded-lg w-80 m-4">
            <h3 className="text-xl font-semibold mb-4">Utility Management</h3>
            <p>Seamless tracking of energy usage and transaction history.</p>
          </div>
          <div className="feature-card bg-white p-6 shadow-lg rounded-lg w-80 m-4">
            <h3 className="text-xl font-semibold mb-4">Transparent Transactions</h3>
            <p>Blockchain ensures all transactions are secure and transparent.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works py-16 bg-white text-center">
        <h2 className="text-3xl font-bold mb-8">How It Works</h2>
        <p className="mb-8 text-lg">Our platform facilitates energy trading through a decentralized process.</p>
        <div className="steps flex flex-wrap justify-around">
          <div className="step bg-gray-50 p-6 rounded-lg shadow-md w-80 m-4">
            <h3 className="text-xl font-semibold mb-2">Step 1: Register</h3>
            <p>Create an account to start trading energy.</p>
          </div>
          <div className="step bg-gray-50 p-6 rounded-lg shadow-md w-80 m-4">
            <h3 className="text-xl font-semibold mb-2">Step 2: Buy or Sell</h3>
            <p>Initiate buying or selling of energy with transparent rates.</p>
          </div>
          <div className="step bg-gray-50 p-6 rounded-lg shadow-md w-80 m-4">
            <h3 className="text-xl font-semibold mb-2">Step 3: Track Transactions</h3>
            <p>Manage and view all transactions securely on the blockchain.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials py-16 bg-gray-100 text-center">
        <h2 className="text-3xl font-bold mb-8">What People Are Saying</h2>
        <div className="flex flex-wrap justify-around">
          <div className="testimonial bg-white p-6 shadow-lg rounded-lg w-80 m-4">
            <p className="italic">"Trading energy directly has never been easier!"</p>
            <h4 className="text-xl font-semibold mt-4">- Alex</h4>
          </div>
          <div className="testimonial bg-white p-6 shadow-lg rounded-lg w-80 m-4">
            <p className="italic">"Blockchain ensures secure trades every time."</p>
            <h4 className="text-xl font-semibold mt-4">- Jamie</h4>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-gray-800 text-white text-center py-8">
        <p>&copy; 2024 Energy Trading Platform. All rights reserved.</p>
        <div className="social-links mt-4">
          <a href="#" className="text-blue-300 px-4">Twitter</a>
          <a href="#" className="text-blue-300 px-4">LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
