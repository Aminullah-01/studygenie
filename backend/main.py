
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from utils import clean_text, extract_text_from_pdf

app = FastAPI(title="StudyGenie API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudyRequest(BaseModel):
    text: str

@app.post("/summarize")
async def summarize(request: StudyRequest):
    # logic to call Gemini API would go here
    cleaned = clean_text(request.text)
    return {"summary": "Generated summary for: " + cleaned[:100]}

@app.post("/generate-quiz")
async def generate_quiz(request: StudyRequest):
    return {"quiz": "10 questions generated"}

@app.post("/explain")
async def explain(request: StudyRequest):
    return {"explanation": "ELI5 explanation generated"}

@app.post("/study-plan")
async def study_plan(request: StudyRequest):
    return {"plan": "Daily schedule generated"}

@app.post("/flashcards")
async def flashcards(request: StudyRequest):
    return {"flashcards": "10 flashcards generated"}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file format")
    
    contents = await file.read()
    text = extract_text_from_pdf(contents)
    return {"text": text}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
