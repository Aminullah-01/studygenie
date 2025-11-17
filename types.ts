
export enum AppView {
  Home = 'home',
  Dashboard = 'dashboard',
  Results = 'results',
}

export enum GenerationType {
  Summary = 'summary',
  Quiz = 'quiz',
  ELI5 = 'eli5',
  StudyPlan = 'study_plan',
  Flashcards = 'flashcards',
}

export interface MCQQuestion {
  question: string;
  options: string[];
  answer: string;
  type: 'mcq';
}

export interface TFQuestion {
  question: string;
  answer: boolean;
  type: 'tf';
}

export interface ShortAnswerQuestion {
  question: string;
  answer: string;
  type: 'short';
}

export type QuizQuestion = MCQQuestion | TFQuestion | ShortAnswerQuestion;

export interface Quiz {
  questions: QuizQuestion[];
}

export interface StudyPlanDay {
  day: number;
  topic: string;
  goals: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudyPlan {
  plan: StudyPlanDay[];
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface GeneratedContent {
  summary?: string;
  quiz?: Quiz;
  explanation?: string;
  studyPlan?: StudyPlan;
  flashcards?: Flashcard[];
}
