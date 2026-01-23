
# StudyGenie - AI-Powered Study Companion

StudyGenie is a world-class educational tool that leverages the Gemini 3 API to help students transform their notes into interactive study materials.

## 🚀 Features
- **AI Summaries**: Short, medium, and long-form structured notes.
- **Smart Quizzes**: MCQs, True/False, and Short Answer questions.
- **ELI5 Mode**: Complex topics explained for a 5-year-old.
- **Study Plans**: Day-by-day learning schedules with goal tracking.
- **Flashcards**: Interactive 3D flip-cards for active recall.
- **History**: Persistent local storage of your previous study sessions.

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, PDF.js
- **AI**: Google Gemini 3 (Flash Preview)
- **Backend (Optional/Requested)**: FastAPI (Python)
- **Database**: MySQL (Schema provided)

## 📦 Setup Instructions

### 1. Frontend (Local Development)
1. Ensure Node.js is installed.
2. In the project root, the app runs via the provided `index.tsx`.
3. Set your Gemini API key in the environment variables (handled automatically in this preview environment).

### 2. Backend (FastAPI)
If you wish to run the Python backend independently:
1. Navigate to `/backend`.
2. Install dependencies:
   ```bash
   pip install fastapi uvicorn pydantic python-multipart
   ```
3. Run the server:
   ```bash
   python main.py
   ```
4. Update `services/geminiService.ts` to call `localhost:8000` if you prefer backend-mediated AI calls.

### 3. Database
1. Open your MySQL client.
2. Run the script in `/database/schema.sql`.
3. This creates tables for Users, Notes, and Results.

## 🌐 Deployment

### Render (Backend)
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new "Web Service".
3. Use Build Command: `pip install -r requirements.txt`.
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. Add `API_KEY` to Environment Variables.

### Vercel (Frontend)
1. Push your code to GitHub.
2. Connect the repo to [Vercel](https://vercel.com).
3. Vercel will automatically detect the React project.
4. Add `API_KEY` to Environment Variables.

## 📝 Integration Example (Frontend -> API)
The app uses the **Google Generative AI SDK** directly for zero-latency interactions. Here is how the response is handled:
```typescript
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: text,
  config: { responseMimeType: "application/json", responseSchema: schema }
});
const data = JSON.parse(response.text);
// Update UI state with data
```

---
Built with ❤️ by StudyGenie Team
