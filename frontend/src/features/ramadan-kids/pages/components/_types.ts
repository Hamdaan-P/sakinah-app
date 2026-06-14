/**
 * Data types used by the RamadanKidsPage components.
 */

export interface DailyMission {
  title: string;
  description: string;
  points: number;
  icon: React.ReactNode;
  color: string;
}

export interface SeerahQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TrueFalseQuestion {
  statement: string;
  answer: boolean;
  explanation: string;
}

export interface RoutineStep {
  time: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export interface QA {
  question: string;
  answer: string;
  type: string;
}
