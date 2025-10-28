const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate'); // Import the Candidate model


// --- NEW ROUTE ---
// @route   GET /api/candidates
// @desc    Get all candidates
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Find all candidates and sort them by creation date (newest first)
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   POST /api/candidates
// @desc    Create a new candidate
// @access  Public
router.post('/', async (req, res) => {
  try {
    // Extract name and email from the request body
    const { name, email } = req.body;

    // Create a new candidate instance using our model
    const newCandidate = new Candidate({
      name,
      email,
      // We can add other fields here later
    });

    // Save the new candidate to the database
    const candidate = await newCandidate.save();

    // Respond with the saved candidate data
    res.status(201).json(candidate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NEW ROUTE ---
// @route   PUT /api/candidates/:id/status
// @desc    Update a candidate's status
// @access  Public
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    // Check if the status is valid
    const validStatuses = ['Applied', 'Screening', 'Interview', 'Offered', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ msg: 'Candidate not found' });
    }

    candidate.status = status;
    await candidate.save();

    res.json(candidate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



module.exports = router;