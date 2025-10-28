const express = require('express');
const connectDB = require('./config/db');
 const cors = require('cors'); // <-- Import cors
// Connect to Database
connectDB();

const app = express();

// Init Middleware to parse JSON bodies
 app.use(cors()); // <-- Use cors middleware
app.use(express.json({ extended: false })); // <-- Add this line

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Welcome to the AI HR Agent API!');
});

// Define Routes
app.use('/api/candidates', require('./routes/candidates')); // <-- Add this line
app.use('/api/jobs', require('./routes/jobs')); // <-- Add this line
app.use('/auth', require('./routes/auth')); // <-- Add this line
app.use('/api/gmail', require('./routes/gmail')); // <-- Add this line

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});