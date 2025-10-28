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
# In a real application, this list would be much larger and could be stored in a database
SKILLS_LIST = [
    "python", "javascript", "react", "react.js", "node.js", "nodejs",
    "mongodb", "sql", "mysql", "postgresql", "aws", "docker", "git",
    "html", "css", "fastapi", "flask", "django", "java", "c++",
    "typescript", "express", "tailwind", "bootstrap"
]

# Initialize spaCy's Matcher with the shared vocabulary
matcher = Matcher(nlp.vocab)

# Create patterns for the matcher
# We create case-insensitive patterns for each skill
for skill in SKILLS_LIST:
    # Handle skills with special characters like "c++" or "node.js"
    # This creates a pattern that matches the skill as a single token
    pattern = [{"LOWER": skill.replace(".", "_").replace(" ", "_").replace("+", "p")}]
    matcher.add(skill, [pattern])
    
    # Optional: handle multi-word skills if needed, e.g., "machine learning"
    if " " in skill:
        pattern_multi = [{"LOWER": t} for t in skill.split()]
        matcher.add(skill, [pattern_multi])


def extract_details(text):
    doc = nlp(text)
    name, email, phone = None, None, None

    # Extract Name (find the first PERSON entity)
    for ent in doc.ents:
        if ent.label_ == "PERSON" and not name:
            name = ent.text
            break
            
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
    found_skills = set()  # Use a set to avoid duplicate skills
    for match_id, start, end in matches:
        # Get the original skill string from the match_id (which we set as the skill name)
        skill_name = nlp.vocab.strings[match_id]
        found_skills.add(skill_name)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": list(found_skills)  # Convert the set back to a list
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