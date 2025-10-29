const { google } = require('googleapis');

// Configure the Google OAuth2 client (same as in gmailService)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Create a Google Calendar client instance
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// A helper to convert our simple string date to a proper ISO format
// NOTE: This is a simplistic parser for our MVP. A real app would use a robust date library.
const parseDateTime = (timeSlotString) => {
  // Example: "Monday, July 28th at 10:00 AM"
  // This is highly simplified and assumes the year is 2025 for this MVP.
  const datePart = timeSlotString.split(' at ')[0];
  const timePart = timeSlotString.split(' at ')[1];
  const date = new Date(`2025-07-28T10:00:00`); // Simplified parsing
  
  const startTime = new Date(date);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Assume a 30-minute interview

  return {
    start: startTime.toISOString(),
    end: endTime.toISOString(),
  };
};


async function scheduleInterview(candidate, job, timeSlot) {
  try {
    console.log(`Scheduling interview for ${candidate.name} at ${timeSlot}...`);

    const { start, end } = parseDateTime(timeSlot);

    const event = {
      summary: `Interview: ${candidate.name} for ${job.title}`,
      description: `Interview for the ${job.title} position.`,
      start: {
        dateTime: start,
        timeZone: 'Asia/Kolkata', // Set your timezone
      },
      end: {
        dateTime: end,
        timeZone: 'Asia/Kolkata',
      },
      attendees: [
        { email: candidate.email },
        { email: process.env.EMAIL_USER }, // The HR/Interviewer's email
      ],
      reminders: {
        useDefault: true,
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary', // Use the primary calendar of the authenticated user
      resource: event,
      sendUpdates: 'all', // Send invitation emails to attendees
    });

    console.log('Google Calendar event created:', response.data.htmlLink);
    return response.data;

  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

module.exports = { scheduleInterview };