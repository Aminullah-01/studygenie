
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationType, GeneratedContent, Quiz, StudyPlan, Flashcard } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getModel = () => 'gemini-2.5-pro';

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, enum: ['mcq', 'tf', 'short'] },
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    answer: { type: Type.STRING },
                },
                required: ['type', 'question', 'answer']
            }
        }
    },
    required: ['questions']
};

const studyPlanSchema = {
    type: Type.OBJECT,
    properties: {
        plan: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    topic: { type: Type.STRING },
                    goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                    difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] }
                },
                required: ['day', 'topic', 'goals', 'difficulty']
            }
        }
    },
    required: ['plan']
};

const flashcardsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING }
        },
        required: ['front', 'back']
    }
};


export const generateContent = async (
  type: GenerationType,
  text: string,
  options?: { summaryLength?: 'short' | 'medium' | 'long' }
): Promise<GeneratedContent> => {
  const model = getModel();
  
  const basePrompt = `Based on the following text, please perform the requested action. The text is:\n\n---\n${text}\n---\n\n`;

  try {
    switch (type) {
      case GenerationType.Summary: {
        const length = options?.summaryLength || 'medium';
        const prompt = `${basePrompt}Generate a ${length} summary.`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        return { summary: response.text };
      }
      case GenerationType.Quiz: {
        const prompt = `${basePrompt}Generate a quiz with 10 questions: 5 multiple choice, 3 true/false, and 2 short answer questions.`;
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: "application/json", responseSchema: quizSchema }
        });
        const quizData = JSON.parse(response.text);
        // A little type guard to be safe
        const isQuiz = (data: any): data is Quiz => 'questions' in data && Array.isArray(data.questions);
        if (!isQuiz(quizData)) throw new Error("Invalid quiz format received from API");
        return { quiz: quizData };
      }
      case GenerationType.ELI5: {
        const prompt = `${basePrompt}Explain this topic in simple terms, like you're explaining it to a 5-year-old.`;
        const response = await ai.models.generateContent({ model, contents: prompt });
        return { explanation: response.text };
      }
      case GenerationType.StudyPlan: {
        const prompt = `${basePrompt}Create a personalized, day-by-day study plan to master this topic. Include learning goals and a difficulty ranking for each day's topic.`;
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: "application/json", responseSchema: studyPlanSchema }
        });
        const planData = JSON.parse(response.text);
        const isStudyPlan = (data: any): data is StudyPlan => 'plan' in data && Array.isArray(data.plan);
        if (!isStudyPlan(planData)) throw new Error("Invalid study plan format received from API");
        return { studyPlan: planData };
      }
      case GenerationType.Flashcards: {
        const prompt = `${basePrompt}Generate 10 flashcards. For each flashcard, provide a "front" (a term or question) and a "back" (the definition or answer).`;
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { responseMimeType: "application/json", responseSchema: flashcardsSchema }
        });
        const flashcardsData = JSON.parse(response.text);
        const areFlashcards = (data: any): data is Flashcard[] => Array.isArray(data) && data.every(item => 'front' in item && 'back' in item);
        if (!areFlashcards(flashcardsData)) throw new Error("Invalid flashcards format received from API");
        return { flashcards: flashcardsData };
      }
      default:
        throw new Error('Invalid generation type');
    }
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw new Error("Failed to generate content. The model may be busy, please try again.");
  }
};
