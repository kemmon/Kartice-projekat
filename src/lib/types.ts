export type Card = {
  id: string;
  kapitel: number;
  de: {
    word: string;
    synonym?: string;
    explanation: string;
    example: string;
  };
  bs: {
    word: string;
    explanation_translation: string;
    example_translation: string;
  };
};

export type Progress = {
  seen: number;
  correct: number;
  incorrect: number;
  half: number;
  lastSeen: number;
  learned: boolean;
};

export type ProgressMap = Record<string, Progress>;