const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Public (for now)
router.post('/', async (req, res) => {
  try {
    const { title, description, skills } = req.body;

    // The skills might come as a comma-separated string from a form
    // We'll split it into an array and trim whitespace from each skill
    const skillsArray = skills.split(',').map(skill => skill.trim());

    const newJob = new Job({
      title,
      description,
      skills: skillsArray,
    });

    const job = await newJob.save();
    res.status(201).json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/jobs
// @desc    Get all job postings
// @access  Public (for now)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'Open' }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;