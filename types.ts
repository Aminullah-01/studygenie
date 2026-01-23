
export type QuizType = 'mcq' | 'true-false' | 'short-answer';

export interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
  type: QuizType;
  explanation: string;
  topic: string;
  reviewSuggestion: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface StudyPlanDay {
  day: number;
  focus: string;
  tasks: string[];
}

export interface StudyPlan {
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  learningGoals: string[];
  schedule: StudyPlanDay[];
}

export interface StudyResult {
  summary?: {
    short: string;
    medium: string;
    long: string;
  };
  quiz?: QuizQuestion[];
  explanation?: string;
  studyPlan?: StudyPlan;
  flashcards?: Flashcard[];
}

export type FeatureType = 'summary' | 'quiz' | 'explain' | 'plan' | 'flashcards';

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: FeatureType;
  sourceSnippet: string;
  result: StudyResult;
}

export type PageType = 'home' | 'dashboard' | 'results' | 'history';

export interface AppState {
  sourceText: string;
  isLoading: boolean;
  activeFeature: FeatureType | null;
  results: StudyResult;
  history: HistoryItem[];
  error: string | null;
}
