import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddJobModal from './AddJobModal'; // Import the modal component

const API_URL = 'http://localhost:5000/api/jobs';

function JobPostings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [formError, setFormError] = useState(null);   // State for form errors

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(API_URL);
        setJobs(response.data);
      } catch (err) {
        setError('Failed to fetch job postings.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Handle saving a new job from the modal
  const handleSaveJob = async (jobData) => {
    try {
      setFormError(null); // Clear previous errors
      const response = await axios.post(API_URL, jobData);
      setJobs([response.data, ...jobs]); // Add new job to the top of the list
      setShowModal(false); // Close the modal
    } catch (err) {
      setFormError('Failed to create job. Please check the details and try again.');
      console.error(err);
    }
  };

  if (loading) return <p className="text-center">Loading jobs...</p>;
  if (error) return <p className="text-center text-danger">{error}</p>;

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center bg-white py-3">
          <h5 className="mb-0">Open Job Postings ({jobs.length})</h5>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            + Create New Job
          </button>
        </div>
        <div className="card-body">
          {jobs.length > 0 ? (
            <div className="list-group">
              {jobs.map((job) => (
                <div key={job._id} className="list-group-item list-group-item-action">
                  <div className="d-flex w-100 justify-content-between">
                    <h6 className="mb-1">{job.title}</h6>
                    <small className="text-muted">{new Date(job.createdAt).toLocaleDateString()}</small>
                  </div>
                  <p className="mb-2 text-muted">{job.description}</p>
                  <div>
                    {job.skills.map((skill, index) => (
                      <span key={index} className="badge bg-secondary me-1 fw-normal">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted mt-3">No open job postings found. Click "Create New Job" to add one.</p>
          )}
        </div>
      </div>

      {showModal && (
        <AddJobModal
          onSave={handleSaveJob}
          onHide={() => {
            setShowModal(false);
            setFormError(null); // Clear errors when closing
          }}
          error={formError}
        />
      )}
    </>
  );
}

export default JobPostings;