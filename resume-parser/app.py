import base64
import fitz  # PyMuPDF
import io
import spacy
import re
from flask import Flask, request, jsonify
from spacy.matcher import Matcher

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")
app = Flask(__name__)

# Pre-define a list of skills to look for
SKILLS_LIST = [
    "python", "javascript", "react", "react.js", "node.js", "nodejs",
    "mongodb", "sql", "mysql", "postgresql", "aws", "docker", "git",
    "html", "css", "fastapi", "flask", "django", "java", "c++",
    "typescript", "express", "tailwind", "bootstrap"
]

# Initialize spaCy's Matcher
matcher = Matcher(nlp.vocab)

# Create patterns for the matcher
for skill in SKILLS_LIST:
    pattern = [{"LOWER": skill}]
    matcher.add(skill, [pattern])

def extract_details(text):
    doc = nlp(text)
    name, email, phone = None, None, None

    # Improved Name Extraction
    # Method 1: Look for a PERSON entity near the top of the resume.
    for ent in doc.ents:
        if ent.label_ == "PERSON" and ent.start_char < 200:
            name = ent.text
            break
    
    # Method 2 (Fallback): If no PERSON found, grab the first sensible line.
    if not name:
        lines = [line for line in text.split('\n') if line.strip()]
        if lines:
            potential_name = lines[0].strip()
            if not any(char.isdigit() for char in potential_name) and len(potential_name) > 2:
                name = potential_name
            
    # Extract Email using regex
    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
    if email_match:
        email = email_match.group(0)
        
    # Extract Phone using regex
    phone_match = re.search(r"(\+\d{1,3}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}", text)
    if phone_match:
        phone = phone_match.group(0)
    
    # Use the matcher to find skills
    matches = matcher(doc)
    found_skills = set()
    for match_id, start, end in matches:
        skill_name = nlp.vocab.strings[match_id]
        found_skills.add(skill_name)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": list(found_skills)
    }

@app.route('/parse', methods=['POST'])
def parse_resume():
    if 'file' not in request.json:
        return jsonify({"error": "Missing file data in request"}), 400

    base64_data = request.json['file']

    try:
        # Fix base64 padding and URL-safe characters
        base64_data = base64_data.replace('-', '+').replace('_', '/')
        missing_padding = len(base64_data) % 4
        if missing_padding:
            base64_data += '=' * (4 - missing_padding)

        resume_bytes = base64.b64decode(base64_data)
        resume_stream = io.BytesIO(resume_bytes)
        
        doc = fitz.open(stream=resume_stream, filetype="pdf")
        
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()

        extracted_data = extract_details(text)
        
        return jsonify(extracted_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Resume Parser Service is running"})

if __name__ == '__main__':
    app.run(port=5001, debug=True)