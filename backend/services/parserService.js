const axios = require('axios');

const PARSER_API_URL = 'http://localhost:5001/parse';

async function parseResume(base64Data) {
  try {
    console.log('Sending resume data to Python parser...');
    
    const response = await axios.post(PARSER_API_URL, {
      file: base64Data,
    });

    // Let's also make this log message more accurate
    console.log('Successfully received response from parser.');
    
    // --- CORRECTED LINE ---
    // Return the entire data object from the response
    return response.data; 

  } catch (error) {
    console.error('Error calling Python parser service:', error.response ? error.response.data : error.message);
    // Return the error object from python if it exists
    return error.response ? error.response.data : null;
  }
}

module.exports = { parseResume };