const Groq = require('groq-sdk');

// 1. Initialize the Groq client with the API key from our .env file
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 2. Define the function to generate the email content
async function generateInitialReply(candidateName) {
  // Use a default name if none is provided to avoid errors
  const name = candidateName || 'there';

  try {
    console.log(`Generating AI reply for ${name}...`);
    
    // 3. Call the Groq API to get a chat completion
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a friendly and professional HR assistant. Your tone should be encouraging and welcoming. Keep your responses concise, around 4-5 sentences.',
        },
        {
          role: 'user',
          content: `Generate a short email to a candidate named ${name}, acknowledging that we have received their resume. Thank them for their interest in our company and tell them we are reviewing their application and will get back to them soon.`,
        },
      ],
      // We use Llama3 8b for a good balance of speed and quality
      model: 'llama-3.1-8b-instant', 
    });

    // 4. Extract the generated content from the response
    const replyContent = chatCompletion.choices[0]?.message?.content || "Thank you for your application. We will review it shortly.";
    
    console.log(`AI reply generated successfully.`);
    return replyContent;

  } catch (error) {
    console.error('Error generating AI reply:', error);
    // Provide a fallback message in case the API fails
    return `Hi ${name},\n\nThank you for applying. We have received your resume and our team is currently reviewing it. We appreciate your interest in our company and will be in touch soon.\n\nBest regards,\nHR Team`;
  }
}

// 5. Export the function
module.exports = {
  generateInitialReply,
};