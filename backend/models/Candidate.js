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
    enum: ['Applied', 'Screening', 'Interview', 'Offered', 'Rejected'], // Predefined statuses
    default: 'Applied', // Default status when a new candidate is created
  },
  resumeUrl: {
    type: String, // A link to the resume file (we'll use this later)
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