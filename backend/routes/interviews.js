const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const { generateInterviewInvitation } = require('../services/aiService'); // New AI function
const { sendEmail } = require('../services/emailService');
const Job = require('../models/Job'); // Import Job model
const { scheduleInterview } = require('../services/calendarService'); // Import calendar service

// @route   POST /api/interviews/send-invitation
// @desc    Send an interview invitation email to a candidate
// @access  Public (for now)
router.post('/send-invitation', async (req, res) => {
  const { candidateId } = req.body;

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ msg: 'Candidate not found' });
    }

    // 1. Generate the unique scheduling link for the candidate
    // In a real app, the domain would be your production frontend URL
    const schedulingLink = `http://localhost:5173/schedule/${candidate._id}`;

    // 2. Generate the email content using Groq
    const emailContent = await generateInterviewInvitation(candidate.name, schedulingLink);
    
    // 3. Send the email
    await sendEmail(
      candidate.email,
      'Invitation to Interview',
      emailContent
    );

    res.json({ msg: 'Interview invitation sent successfully.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// --- NEW ROUTE ---
// @route   POST /api/interviews/schedule
// @desc    Schedule the interview in Google Calendar
router.post('/schedule', async (req, res) => {
  const { candidateId, timeSlot } = req.body;

  try {
    const candidate = await Candidate.findById(candidateId).populate('matchedJob');
    if (!candidate) {
      return res.status(404).json({ msg: 'Candidate not found' });
    }
    if (!candidate.matchedJob) {
      return res.status(400).json({ msg: 'Candidate has no matched job.' });
    }
    
    // Schedule the event in Google Calendar
    await scheduleInterview(candidate, candidate.matchedJob, timeSlot);

    // Update the candidate's status
    candidate.status = 'Interview Scheduled';
    await candidate.save();
    
    res.json({ msg: 'Interview scheduled successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

