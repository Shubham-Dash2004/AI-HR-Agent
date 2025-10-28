import React, { useState } from 'react';

function AddCandidateModal({ onSave, onHide }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, email, phone, receivedVia: 'Manual' });
  };

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Candidate</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input type="tel" className="form-control" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onHide}>Close</button>
                <button type="submit" className="btn btn-primary">Save Candidate</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddCandidateModal;