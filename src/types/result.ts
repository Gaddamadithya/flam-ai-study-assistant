export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizOption {
  id: string; // e.g. "a", "b", "c", "d"
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string; // matches id of QuizOption
  explanation: string;
}

export interface KeyConcept {
  id: string;
  title: string;
  summary: string;
  importance?: 'core' | 'supporting' | 'advanced';
}

export interface StudyDeck {
  id: string;
  title: string;
  topic: string;
  summary: string;
  cards: Flashcard[];
  quiz: QuizQuestion[];
  keyConcepts: KeyConcept[];
  createdAt: number;
}

export interface ValidationSuccess {
  success: true;
  data: StudyDeck;
}

export interface ValidationError {
  success: false;
  error: string;
  details?: string[];
  raw?: unknown;
}

export type ValidationResult = ValidationSuccess | ValidationError;

export type ViewMode = 'cards' | 'quiz' | 'concepts';
