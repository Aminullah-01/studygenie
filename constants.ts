
export const MODEL_FLASH = 'gemini-3-flash-preview';
export const MODEL_PRO = 'gemini-3-pro-preview';
export const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

export const SYSTEM_PROMPTS = {
  SUMMARY: "You are an expert academic summarizer. Provide three versions of summary for the text: short (bullet points), medium (paragraphs), and long (detailed analysis). Return valid JSON matching the requested schema.",
  QUIZ: "Generate a quiz with exactly 10 questions based on the provided text: 5 MCQs (multiple choice), 3 True/False, and 2 short answers. For each question, identify the specific 'topic' (e.g., 'Cellular Respiration') and provide a 'reviewSuggestion' explaining exactly what the user should re-read if they get it wrong. Ensure questions test deep understanding, not just surface facts. Return valid JSON.",
  EXPLAIN: "Explain the core concepts of the provided text as if I am 5 years old (ELI5 mode). Use analogies and simple language. Be engaging and encouraging.",
  STUDY_PLAN: "Create a personalized, day-by-day study plan to master this topic. Include learning goals and a difficulty assessment. Be realistic about time requirements. Return valid JSON.",
  FLASHCARDS: "Generate 10 high-quality flashcards for the provided text. Focus on key terms, definitions, and important concepts. Return valid JSON.",
  OCR: "You are an OCR expert. Extract all text accurately from this image of notes. If it's a diagram, describe it briefly in brackets. Just return the text content."
};
