import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// For the MVP, we'll use a predefined list of available slots.
// In a real app, this could be fetched from an API connected to the interviewer's calendar.
const availableSlots = [
  "Monday, July 28th at 10:00 AM",
  "Monday, July 28th at 2:00 PM",
  "Tuesday, July 29th at 11:00 AM",
  "Tuesday, July 29th at 3:00 PM",
  "Wednesday, July 30th at 9:00 AM",
];

function ScheduleInterviewPage() {
  const { candidateId } = useParams(); // Get the candidateId from the URL
  const navigate = useNavigate(); // To redirect the user after submission
  const [selectedSlot, setSelectedSlot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    try {
      // We will build this API endpoint in the next step
      await axios.post('http://localhost:5000/api/interviews/schedule', {
        candidateId,
        timeSlot: selectedSlot,
      });
      setIsSuccess(true);
    } catch (err) {
      setError('Sorry, something went wrong. Please try again or contact us.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container text-center mt-5">
        <div className="alert alert-success">
          <h4>Thank You!</h4>
          <p>Your interview has been scheduled successfully.</p>
          <p>You will receive a confirmation email with a Google Calendar invitation shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
        <div className="card-body p-4">
          <h3 className="card-title text-center mb-4">Schedule Your Interview</h3>
          <p className="text-muted text-center">Please select a time slot that works best for you.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="my-4">
              {availableSlots.map((slot, index) => (
                <div key={index} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="interviewSlot"
                    id={`slot-${index}`}
                    value={slot}
                    checked={selectedSlot === slot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor={`slot-${index}`}>
                    {slot}
                  </label>
                </div>
              ))}
            </div>

            {error && <p className="text-danger">{error}</p>}

            <div className="d-grid">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Scheduling...' : 'Confirm Your Time'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ScheduleInterviewPage;