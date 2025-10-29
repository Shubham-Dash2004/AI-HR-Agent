# 🤖 AI HR Agent  

An intelligent, full-stack **recruitment automation system** designed to streamline the entire hiring pipeline — from **resume intake to interview scheduling**.  
This project leverages **AI** and modern **web technologies** to minimize manual HR work and enable **smart candidate screening**.

---

## ✨ Core Features  

- **📧 Automated Resume Intake** — Connects to Gmail to automatically fetch unread emails with attached resumes.  
- **🧠 Intelligent Resume Parsing** — A Python (Flask + spaCy) microservice extracts candidate details such as name, email, phone, skills, and experience from PDF resumes.  
- **🎯 Context-Aware Job Matching** — Smart algorithm compares extracted skills with job requirements and generates a weighted match score.  
- **🚀 AI-Powered Communication** — Uses the **Groq AI API (Llama 3.1)** to generate personalized acknowledgment and interview emails.  
- **📅 Automated Interview Scheduling** — Integrates **Google Calendar API** for candidates to choose time slots, creating events automatically.  
- **🖥️ Professional Admin Dashboard** — Built with **React + Bootstrap**, allowing HRs to view candidates, manage jobs, update statuses, and monitor progress.

---

## 🏛️ System Architecture  

The project follows a **microservice architecture**, separating the backend, AI parser, and admin dashboard for scalability and modularity.  

```mermaid
graph TD
    subgraph "Input Channels"
        A[Candidate via Email]
    end

    subgraph "Core Backend (Node.js + Express)"
        B[API Server]
        B -->|Fetch Resumes| C(Gmail API)
        B -->|Send Resume Data| D[Python Parser]
        B -->|Generate Replies| E(Groq AI API)
        B -->|Schedule Interviews| F(Google Calendar API)
        B -->|Store Data| G[(MongoDB Atlas)]
    end

    subgraph "AI & NLP Service (Python + Flask)"
        D -->|Parse & Extract Skills| D
    end

    subgraph "Admin Interface (React)"
        H[Admin User] <--> I{React Dashboard}
        I -->|API Calls| B
    end

    A --> B
🛠️ Tech Stack
Category	Technologies
Backend	Node.js, Express.js
Frontend	React.js, Vite, React Router, Axios, Bootstrap
AI & NLP Service	Python, Flask, spaCy, PyMuPDF
Database	MongoDB Atlas (Mongoose)
AI Text Generation	Groq AI API (Llama 3.1)
APIs & Services	Google API (Gmail, Calendar), Nodemailer

🚀 Getting Started
🔧 Prerequisites
Node.js (v18 or later)

Python (v3.9 or later)

Git

MongoDB Atlas account

Google Cloud Platform (OAuth credentials)

Groq AI account

1️⃣ Clone the Repository
bash
Copy code
git clone https://github.com/Shubham-Dash2004/AI-HR-Agent.git
cd AI-HR-Agent
2️⃣ Backend Setup
bash
Copy code
cd backend
npm install

# Create .env file and fill in credentials from .env.example
touch .env

# Run the server
npm start
# Runs on: http://localhost:5000
3️⃣ Python Parser Setup
bash
Copy code
cd ../resume-parser
python -m venv venv
source venv/bin/activate   # On Windows: .\venv\Scripts\activate

pip install Flask PyMuPDF spacy
python -m spacy download en_core_web_sm

# Run parser service
python app.py
# Runs on: http://localhost:5001
4️⃣ Frontend Setup
bash
Copy code
cd ../frontend
npm install
npm run dev
# Runs on: http://localhost:5173
🔑 Environment Variables
Create a .env file in the backend/ directory with:

env
Copy code
# MongoDB
MONGO_URI=your_mongodb_connection_string

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
REDIRECT_URI=http://localhost:5000/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Groq AI
GROQ_API_KEY=your_groq_api_key

# Nodemailer (Gmail App Password)
EMAIL_USER=your_hr_email@gmail.com
EMAIL_PASS=your_16_character_gmail_app_password
🎥 Demo (Suggestion)
🎬 Record a short GIF demo showing:

A candidate sends an email.

Candidate appears on the dashboard with a match score.

HR updates status → interview invite sent automatically.

You can use tools like ScreenToGif or Giphy Capture.

📄 License
This project is licensed under the MIT License — see the LICENSE file for details.