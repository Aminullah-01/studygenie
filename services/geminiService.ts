
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MODEL_FLASH, MODEL_PRO, MODEL_TTS, SYSTEM_PROMPTS } from "../constants";
import { QuizQuestion, Flashcard, StudyPlan, StudyResult } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing from environment.");
  return new GoogleGenAI({ apiKey });
};

export const generateSummary = async (text: string): Promise<NonNullable<StudyResult['summary']>> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: text,
    config: {
      systemInstruction: SYSTEM_PROMPTS.SUMMARY,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          short: { type: Type.STRING },
          medium: { type: Type.STRING },
          long: { type: Type.STRING }
        },
        required: ["short", "medium", "long"]
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateQuiz = async (text: string): Promise<QuizQuestion[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: text,
    config: {
      systemInstruction: SYSTEM_PROMPTS.QUIZ,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            type: { type: Type.STRING },
            explanation: { type: Type.STRING },
            topic: { type: Type.STRING },
            reviewSuggestion: { type: Type.STRING }
          },
          required: ["question", "answer", "type", "explanation", "topic", "reviewSuggestion"]
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const explainLikeIWas5 = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: text,
    config: { systemInstruction: SYSTEM_PROMPTS.EXPLAIN }
  });
  return response.text;
};

export const generateStudyPlan = async (text: string): Promise<StudyPlan> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_PRO,
    contents: text,
    config: {
      systemInstruction: SYSTEM_PROMPTS.STUDY_PLAN,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          learningGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
          schedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER },
                focus: { type: Type.STRING },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateFlashcards = async (text: string): Promise<Flashcard[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: text,
    config: {
      systemInstruction: SYSTEM_PROMPTS.FLASHCARDS,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const speakExplanation = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_TTS,
    contents: [{ parts: [{ text: `Say clearly and kindly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
      }
    }
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const scanNotesOCR = async (base64Image: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_FLASH,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: SYSTEM_PROMPTS.OCR }
      ]
    }
  });
  return response.text;
};
