// 1. Import mongoose and dotenv
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// 2. Define the connection function
const connectDB = async () => {
  try {
    // Attempt to connect to the MongoDB database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    // If an error occurs, log the error and exit the process
    console.error(err.message);
    process.exit(1);
  }
};

// 3. Export the function
module.exports = connectDB;