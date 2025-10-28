import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CandidateList.css'; // Custom styles
import AddCandidateModal from './AddCandidateModal'; // Import the modal

const API_URL = 'http://localhost:5000/api/candidates';

// Helper function for status badges
const getStatusBadge = (status) => {
  switch (status) {
    case 'Interview':
      return 'bg-success';
    case 'Rejected':
      return 'bg-danger';
    case 'Screening':
      return 'bg-warning text-dark';
    case 'Offered':
      return 'bg-info';
    case 'Applied':
    default:
      return 'bg-primary';
  }
};

function CandidateList() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // State for modal visibility

  // Fetch initial candidate data
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get(API_URL);
        setCandidates(response.data);
      } catch (err) {
        setError('Failed to fetch candidates. Is the backend server running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  // Handle status updates from the dropdown
  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistic UI Update
      const updatedCandidates = candidates.map((c) =>
        c._id === id ? { ...c, status: newStatus } : c
      );
      setCandidates(updatedCandidates);
      
      await axios.put(`${API_URL}/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
      // Optionally, revert the state and show an error message
    }
  };

  // Handle saving a new candidate from the modal
  const handleSaveCandidate = async (newCandidateData) => {
    try {
      const response = await axios.post(API_URL, newCandidateData);
      setCandidates([response.data, ...candidates]); // Add to the top of the list
      setShowModal(false); // Close modal on success
    } catch (err) {
      console.error('Failed to add candidate:', err);
    }
  };

  if (loading) return <p className="text-center">Loading candidates...</p>;
  if (error) return <p className="text-center text-danger">{error}</p>;

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center bg-white py-3">
          <h5 className="mb-0">All Candidates ({candidates.length})</h5>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + Add New Candidate
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Received Via</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length > 0 ? (
                  candidates.map((candidate) => (
                    <tr key={candidate._id}>
                      <td><strong>{candidate.name}</strong></td>
                      <td>{candidate.email}</td>
                      <td>
                        <div className="dropdown">
                          <button
                            className={`btn btn-sm dropdown-toggle ${getStatusBadge(candidate.status)}`}
                            type="button"
                            id={`dropdownMenuButton-${candidate._id}`}
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            data-bs-auto-close="true"
                          >
                            {candidate.status}
                          </button>
                          <ul
                            className="dropdown-menu dropdown-menu-end"
                            aria-labelledby={`dropdownMenuButton-${candidate._id}`}
                            data-bs-strategy="fixed"
                          >
                            {['Applied', 'Screening', 'Interview', 'Offered', 'Rejected'].map((s) => (
                              <li key={s}>
                                <a
                                  className="dropdown-item"
                                  href="#"
                                  onClick={() => handleStatusChange(candidate._id, s)}
                                >
                                  {s}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                      <td>{candidate.receivedVia}</td>
                      <td>{new Date(candidate.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No candidates found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {showModal && (
        <AddCandidateModal
          onSave={handleSaveCandidate}
          onHide={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default CandidateList;