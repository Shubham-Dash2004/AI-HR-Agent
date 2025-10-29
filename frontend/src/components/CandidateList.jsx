import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CandidateList.css';
import AddCandidateModal from './AddCandidateModal';
import CandidateDetailModal from './CandidateDetailModal';

const API_URL = 'http://localhost:5000/api/candidates';

// Helper function for status badges
const getStatusBadge = (status) => {
  switch (status) {
    case 'Interview':
    case 'Interview Scheduled':
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

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

  const handleStatusChange = async (id, newStatus) => {
    try {
      // Optimistic UI Update
      const updatedCandidates = candidates.map((c) =>
        c._id === id ? { ...c, status: newStatus } : c
      );
      setCandidates(updatedCandidates);
      
      await axios.put(`${API_URL}/${id}/status`, { status: newStatus });

      if (newStatus === 'Interview') {
        console.log(`Sending interview invitation to candidate ${id}...`);
        await axios.post('http://localhost:5000/api/interviews/send-invitation', { 
          candidateId: id 
        });
        alert('Interview invitation has been sent!');
      }
    } catch (err) {
      console.error('Failed to update status or send invitation:', err);
      // Revert state on error (optional)
    }
  };

  const handleSaveCandidate = async (newCandidateData) => {
    try {
      const response = await axios.post(API_URL, newCandidateData);
      setCandidates([response.data, ...candidates]);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add candidate:', err);
    }
  };

  const handleRowClick = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleHideDetailModal = () => {
    setSelectedCandidate(null);
  };

  if (loading) return <p className="text-center">Loading candidates...</p>;
  if (error) return <p className="text-center text-danger">{error}</p>;

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center bg-white py-3">
          <h5 className="mb-0">All Candidates ({candidates.length})</h5>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
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
                  <th>Matched Job</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate._id} onClick={() => handleRowClick(candidate)} style={{ cursor: 'pointer' }}>
                    <td><strong>{candidate.name}</strong></td>
                    <td>{candidate.email}</td>
                    <td>{candidate.matchedJob ? candidate.matchedJob.title : 'N/A'}</td>
                    <td><span className="fw-bold">{candidate.matchScore}%</span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="dropdown">
                        <button
                          className={`btn btn-sm dropdown-toggle ${getStatusBadge(candidate.status)}`}
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          {candidate.status}
                        </button>
                        <ul
                          className="dropdown-menu dropdown-menu-end"
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
                    <td>{new Date(candidate.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onHide={handleHideDetailModal}
        />
      )}
      
      {showAddModal && (
        <AddCandidateModal
          onSave={handleSaveCandidate}
          onHide={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}

export default CandidateList;