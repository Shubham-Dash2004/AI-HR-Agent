import React from 'react';
// Import routing components
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CandidateList from './components/CandidateList';
import JobPostings from './components/JobPostings'; // <-- Import JobPostings
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <div className="content-wrap">
        <div className="container py-4">
          <main>
            {/* --- Define the routes here --- */}
            <Routes>
              <Route path="/" element={<CandidateList />} />
              <Route path="/jobs" element={<JobPostings />} />
              {/* A placeholder for the settings page */}
              <Route path="/settings" element={<h2>Settings Page</h2>} />
            </Routes>
          </main>
        </div>
      </div>
      <footer className="footer-custom">{/* ... */}</footer>
    </div>
  );
}

export default App;