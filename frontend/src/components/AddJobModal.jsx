import React, { useState } from 'react';

function AddJobModal({ onSave, onHide, error }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, description, skills });
  };

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Create New Job Posting</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label htmlFor="jobTitle" className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="jobTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="jobDescription" className="form-label">Job Description</label>
                <textarea
                  className="form-control"
                  id="jobDescription"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="jobSkills" className="form-label">Required Skills</label>
                <input
                  type="text"
                  className="form-control"
                  id="jobSkills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  required
                />
                <div className="form-text">
                  Enter skills as a comma-separated list (e.g., React, Node.js, MongoDB).
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>Close</button>
              <button type="submit" className="btn btn-primary">Create Job</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddJobModal;