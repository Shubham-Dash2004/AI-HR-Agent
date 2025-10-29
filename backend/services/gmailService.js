const { google } = require('googleapis');
const { parseResume } = require('./parserService');
const { generateInitialReply } = require('./aiService');
const { sendEmail } = require('./emailService');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');

// Configure the Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Mark an email as read
async function markEmailAsRead(messageId) {
  try {
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
    console.log(`Marked email ${messageId} as read.`);
  } catch (error) {
    console.error(`Failed to mark email ${messageId} as read:`, error.message);
  }
}

// Get email details and attachment
async function getEmailDetails(messageId) {
  try {
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });
    const payload = response.data.payload;
    // ... (rest of the function is the same, no need to copy again for brevity)
    const headers = payload.headers;
    const fromHeader = headers.find(h => h.name === 'From');
    const subjectHeader = headers.find(h => h.name === 'Subject');
    const from = fromHeader ? fromHeader.value : 'Unknown Sender';
    const subject = subjectHeader ? subjectHeader.value : 'No Subject';
    const parts = payload.parts || [];
    const attachment = parts.find(part => part.filename && part.filename.length > 0);
    if (!attachment) return null;
    const attachmentId = attachment.body.attachmentId;
    const attachmentResponse = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId: messageId,
        id: attachmentId,
    });
    return {
        from, subject,
        filename: attachment.filename,
        data: attachmentResponse.data.data,
    };
  } catch (error) {
    console.error(`Error getting email details for message ${messageId}:`, error.message);
    return null;
  }
}

// Pure skill-based scoring function
const calculateMatchScore = (resumeSkills, jobSkills) => {
  const resumeSkillSet = new Set(resumeSkills.map(s => s.toLowerCase()));
  const jobSkillSet = new Set(jobSkills.map(s => s.toLowerCase()));

  if (jobSkillSet.size === 0) return 0;

  // Assume the first 3 skills in the job description are "Core"
  const coreSkills = new Set(Array.from(jobSkillSet).slice(0, 3));
  
  let score = 0;
  const maxScore = 100;
  
  let matchedSkills = 0;
  let matchedCoreSkills = 0;

  jobSkillSet.forEach(jobSkill => {
    if (resumeSkillSet.has(jobSkill)) {
      matchedSkills++;
      if (coreSkills.has(jobSkill)) {
        matchedCoreSkills++;
      }
    }
  });

  // Base score from overall skill match (up to 70 points)
  const skillMatchPercentage = (matchedSkills / jobSkillSet.size);
  score += skillMatchPercentage * 70;

  // Bonus points for matching Core skills (up to 30 points)
  if (coreSkills.size > 0) {
    const coreSkillMatchPercentage = (matchedCoreSkills / coreSkills.size);
    score += coreSkillMatchPercentage * 30;
  }

  return Math.round(Math.min(score, maxScore)); // Return final score, capped at 100
};

// Main function to fetch and process unread emails
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
    
    for (const message of messages) {
      const details = await getEmailDetails(message.id);
      if (details) {
        const extractedData = await parseResume(details.data);
        
        if (extractedData && extractedData.email && !extractedData.error) {
          console.log('--- PARSED RESUME DATA ---');
          console.log(extractedData);
          console.log('--------------------------');
          
          try {
            let candidate = await Candidate.findOne({ email: extractedData.email });

            if (candidate) {
              console.log(`Candidate with email ${extractedData.email} already exists.`);
            } else {
              const openJobs = await Job.find({ status: 'Open' });
              let bestMatch = { jobId: null, jobTitle: null, score: -1 };

              if (openJobs.length > 0 && extractedData.skills && extractedData.skills.length > 0) {
                console.log(`Matching candidate skills against ${openJobs.length} open job(s)...`);
                
                openJobs.forEach(job => {
                  const score = calculateMatchScore(extractedData.skills, job.skills);
                  console.log(`- Match score for "${job.title}": ${score}%`);
                  if (score > bestMatch.score) {
                    bestMatch = { jobId: job._id, score: score, jobTitle: job.title };
                  }
                });
                console.log(`Best match found: Job "${bestMatch.jobTitle}" with score ${bestMatch.score}%`);
              }

               candidate = new Candidate({
                name: extractedData.name || 'Name not found',
                email: extractedData.email,
                phone: extractedData.phone,
                receivedVia: 'Email',
                skills: extractedData.skills,
                matchedJob: bestMatch.jobId,   // <-- Add this line
                matchScore: bestMatch.score,  // <-- Add this line
              });
              
               await candidate.save();
              console.log(`New candidate "${candidate.name}" saved with match score ${bestMatch.score}%`);
             
              const replyContent = await generateInitialReply(candidate.name);
              const subject = 'Thank You for Your Application!';
              await sendEmail(candidate.email, subject, replyContent);
            }
          } catch (dbError) {
            console.error('Error during DB operation or matching:', dbError.message);
          }
        } else {
            console.log('Could not parse resume or essential data (email) is missing.');
        }

        await markEmailAsRead(message.id);
      }
    }
    return messages;
  } catch (error) {
    console.error('Error in fetchUnreadEmails:', error.message);
    return [];
  }
}

module.exports = {
  fetchUnreadEmails,
};