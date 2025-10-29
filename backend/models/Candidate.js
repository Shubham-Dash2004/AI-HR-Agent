const mongoose = require('mongoose');

// Define the schema for the Candidate collection
const CandidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // The candidate's name is required
  },
  email: {
    type: String,
    required: true, // The candidate's email is required
    unique: true,   // Each email must be unique in the collection
  },
  phone: {
    type: String,
  },
  skills: {
    type: [String], // An array of strings to store skills
    default: [],
  },
  status: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview', 'Offered', 'Rejected', 'Interview Scheduled'], // Added new status
    default: 'Applied',
  },
  resumeUrl: {
    type: String, // A link to the resume file (we'll use this later)
  },
   // --- NEW FIELDS ---
  matchedJob: {
    type: mongoose.Schema.Types.ObjectId, // A reference to a Job ID
    ref: 'Job', // This tells Mongoose the ID belongs to the 'Job' collection
  },
   matchScore: {
    type: Number, // The calculated score (e.g., 73)
    default: 0,
  },
  receivedVia: {
    type: String,
    enum: ['Email', 'WhatsApp', 'Manual'], // Source of the application
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the creation date
  },
});

// Create and export the Candidate model
// A model is a constructor compiled from a schema definition.
// An instance of a model is a document.
module.exports = mongoose.model('Candidate', CandidateSchema);