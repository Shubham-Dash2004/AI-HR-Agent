import React from 'react';

// The helper function should be defined outside the component function
// as it doesn't depend on any props or state.
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

function CandidateDetailModal({ candidate, onHide }) {
  if (!candidate) {
    return null;
  }

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{candidate.name}</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Email:</strong> {candidate.email}</p>
                  <p><strong>Phone:</strong> {candidate.phone || 'N/A'}</p>
                  <p><strong>Status:</strong> <span className={`badge ${getStatusBadge(candidate.status)}`}>{candidate.status}</span></p>
                </div>
                <div className="col-md-6">
                  <p><strong>Matched Job:</strong> {candidate.matchedJob ? candidate.matchedJob.title : 'N/A'}</p>
                  <p><strong>Match Score:</strong> <span className="fw-bold">{candidate.matchScore}%</span></p>
                  <p><strong>Applied On:</strong> {new Date(candidate.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <hr />
              <h6>Extracted Skills</h6>
              {candidate.skills && candidate.skills.length > 0 ? (
                <div>
                  {candidate.skills.map((skill, index) => (
                    <span key={index} className="badge bg-secondary me-1 fw-normal">{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No skills were extracted.</p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CandidateDetailModal;