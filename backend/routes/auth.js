const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// 1. Configure the Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// 2. Define the scopes required for our app
// We are asking for permission to read Gmail messages and profile info.
const scopes = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify', // <-- ADD THIS LINE
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar', // <-- ADD THIS SCOPE
];

// 3. Route to start the authentication process
router.get('/google', (req, res) => {
  // Generate a URL that asks for permission for the specified scopes
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' is needed to get a refresh token
    scope: scopes,
  });
  // Redirect the user to this URL
  res.redirect(url);
});

// 4. Route to handle the callback from Google
router.get('/google/callback', async (req, res) => {
  try {
    // Get the authorization code from the query parameters
    const { code } = req.query;
    
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // IMPORTANT: In a real app, you would save these tokens securely
    // For now, we'll just log them to see the process works.
    console.log('Successfully authenticated!');
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token); // This is only sent the first time!

    // Set the credentials on the OAuth2 client for future API calls
    oauth2Client.setCredentials(tokens);

    res.send('Authentication successful! You can now close this tab.');
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Authentication failed.');
  }
});

module.exports = router;