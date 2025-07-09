export interface Topic {
  id: string;
  name: string;
}

export interface QuizState {
  question: string;
  userAnswer: string;
  feedbackText: string;
  status: 'asking' | 'answered';
  imageUrl: string | null;
}

export interface BattlePlayer {
  id: number;
  prompt: string;
  score: number;
  feedback: string;
}

export interface BattleState {
  status: 'configuring' | 'writing' | 'evaluating' | 'results';
  topic: string;
  players: BattlePlayer[];
}

export interface TwentyQuestionsHistoryItem {
  type: 'question' | 'guess';
  text: string;
  answer?: string; // For questions
}

export interface TwentyQuestionsState {
  status: 'idle' | 'starting' | 'playing' | 'evaluating' | 'finished';
  secretWord: string;
  history: TwentyQuestionsHistoryItem[];
  questionsLeft: number;
  gameResult: 'win' | 'lose' | null;
  error: string | null;
}
