import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import CandidateList from './components/CandidateList';
import JobPostings from './components/JobPostings';
import ScheduleInterviewPage from './components/ScheduleInterviewPage'; // <-- Import the new page
import './App.css';

// A new component to handle the main admin layout
function AdminLayout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      <div className="content-wrap">
        <div className="container py-4">
          <main>{children}</main>
        </div>
      </div>
      <footer className="footer-custom">
        <p className="text-muted mb-0 text-center">&copy; {new Date().getFullYear()} AI HR Agent</p>
      </footer>
    </div>
  );
}

function App() {
  const location = useLocation();

  // Conditionally render the layout based on the route
  const isAdminRoute = !location.pathname.startsWith('/schedule');

  return (
    <>
      {isAdminRoute ? (
        <AdminLayout>
          <Routes>
            <Route path="/" element={<CandidateList />} />
            <Route path="/jobs" element={<JobPostings />} />
            <Route path="/settings" element={<h2>Settings Page</h2>} />
          </Routes>
        </AdminLayout>
      ) : (
        <Routes>
          {/* The scheduling page has no Navbar/Footer */}
          <Route path="/schedule/:candidateId" element={<ScheduleInterviewPage />} />
        </Routes>
      )}
    </>
  );
}

export default App;