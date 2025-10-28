const Job = require('../models/Job');
const { google } = require('googleapis');
const { parseResume } = require('./parserService'); // <-- Import the new service
const { generateInitialReply } = require('./aiService'); // Import AI service
const { sendEmail } = require('./emailService');       // Import Email service
const Candidate = require('../models/Candidate'); // <-- Import the Candidate model

// 1. Configure the Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// 2. Set the refresh token
// This is crucial for long-term access without needing to log in again.
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// 3. Create a Gmail client instance
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// NEW: Function to mark an email as read
async function markEmailAsRead(messageId) {
  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'], // Remove the 'UNREAD' label
      },
    });
    console.log(`Marked email ${messageId} as read.`);
  } catch (error) {
    console.error(`Failed to mark email ${messageId} as read:`, error.message);
  }
}

// New function to get details of a single email
async function getEmailDetails(messageId) {
  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    // Extract relevant parts from the email payload
    const payload = response.data.payload;
    const headers = payload.headers;
    const fromHeader = headers.find(h => h.name === 'From');
    const subjectHeader = headers.find(h => h.name === 'Subject');

    const from = fromHeader ? fromHeader.value : 'Unknown Sender';
    const subject = subjectHeader ? subjectHeader.value : 'No Subject';
    
    // Find the attachment
    const parts = payload.parts || [];
    const attachment = parts.find(part => part.filename && part.filename.length > 0);

    if (!attachment) {
      console.log(`Email from ${from} has no attachment.`);
      return null;
    }

    console.log(`Processing email from: ${from} with subject: "${subject}"`);
    console.log(`Found attachment: ${attachment.filename}`);
    
     // MODIFIED: We need the messageId for downloading the attachment
    const attachmentId = attachment.body.attachmentId;
    const attachmentResponse = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId: messageId,
        id: attachmentId,
    });
    
    // The attachment data is base64 encoded
    const attachmentData = attachmentResponse.data.data;


    // We will return attachment details for now. We'll download it next.
    return {
        from,
        subject,
        filename: attachment.filename,
        data: attachmentData, // <-- Return the actual attachment data
    };

  } catch (error) {
    console.error('Error getting email details:', error.message);
    return null;
  }
}


// --- NEW HELPER FUNCTION: Calculate Match Score ---
const calculateMatchScore = (resumeSkills, jobSkills) => {
  // Ensure inputs are arrays and lowercase for case-insensitive comparison
  const lowerResumeSkills = new Set(resumeSkills.map(s => s.toLowerCase()));
  const lowerJobSkills = new Set(jobSkills.map(s => s.toLowerCase()));

  if (lowerJobSkills.size === 0) {
    return 0; // Avoid division by zero if a job has no skills listed
  }

  let matchCount = 0;
  lowerJobSkills.forEach(jobSkill => {
    if (lowerResumeSkills.has(jobSkill)) {
      matchCount++;
    }
  });

  // Score is the percentage of job skills found in the resume
  const score = (matchCount / lowerJobSkills.size) * 100;
  return Math.round(score); // Return a whole number percentage
};

// 4. Function to fetch unread emails with attachments
// Modified function to fetch and process emails
async function fetchUnreadEmails() {
  try {
    console.log('Checking for new emails...');
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread has:attachment',
      includeSpamTrash: true,
    });

    const messages = response.data.messages;
    if (!messages || messages.length === 0) {
      console.log('No new emails found.');
      return [];
    }
    
    console.log(`Found ${messages.length} new email(s).`);

    // Process each message
    for (const message of messages) {
      const details = await getEmailDetails(message.id);
      if (details) {
         // We have the file data!
        console.log(`Successfully downloaded attachment "${details.filename}".`);
           // --- CORRECTED SECTION ---
        // 1. Call the parser service ONCE
        const extractedData = await parseResume(details.data);

        // 2. Check if the data was successfully extracted
        if (extractedData && extractedData.email) { // We'll use email as a key check
        console.log('--- PARSED RESUME DATA ---');
        console.log(extractedData);
        console.log('--------------------------');

        try {
          // --- NEW: Save to Database ---
          // 1. Check if a candidate with this email already exists
          let candidate = await Candidate.findOne({ email: extractedData.email });

          if (candidate) {
            // Candidate exists, maybe update their info in the future
            console.log(`Candidate with email ${extractedData.email} already exists.`);
          } else {

            // --- NEW MATCHING LOGIC ---
          // 1. Fetch all open jobs
          const openJobs = await Job.find({ status: 'Open' });
          
          let bestMatch = { jobId: null, score: -1 };

          if (openJobs.length > 0 && extractedData.skills.length > 0) {
            console.log(`Matching candidate skills against ${openJobs.length} open job(s)...`);
            
            // 2. Calculate score for each job
            openJobs.forEach(job => {
              const score = calculateMatchScore(extractedData.skills, job.skills);
              console.log(`- Match score for "${job.title}": ${score}%`);
              if (score > bestMatch.score) {
                bestMatch = { jobId: job._id, score: score };
              }
            });
            console.log(`Best match found: Job ${bestMatch.jobId} with score ${bestMatch.score}%`);
          }
          // --- END MATCHING LOGIC ---

          // Create new candidate and include the extracted skills and match info
          candidate = new Candidate({
            name: extractedData.name || 'Name not found',
            email: extractedData.email,
            phone: extractedData.phone,
            receivedVia: 'Email',
            skills: extractedData.skills, // Save the extracted skills
            // You can add the match info to the candidate model later if desired
          });
          
          await candidate.save();
          console.log(`New candidate "${candidate.name}" saved to the database!`);
             // --- NEW: GENERATE AND SEND REPLY ---
          // 1. Generate the personalized AI reply
          const replyContent = await generateInitialReply(candidate.name);
          
          // 2. Define the email subject
          const subject = 'Thank You for Your Application!';
          
          // 3. Send the email to the candidate
          await sendEmail(candidate.email, subject, replyContent);
          }
        } catch (dbError) {
          console.error('Error saving candidate to database:', dbError.message);
        }
        
      
        } else {
          console.log('Could not parse resume or essential data (email) is missing.');
        }
        // In the future, we'll send details.data to the Python parser.

        // Now, mark the email as read
        await markEmailAsRead(message.id);
      }
    }

    return messages; // For now, we just return the original list
  } catch (error) {
    console.error('Error fetching emails:', error.message);
    return [];
  }
}


// 5. Export the function
module.exports = {
  fetchUnreadEmails,
};