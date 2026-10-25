export type Register = "casual" | "neutral" | "formal";

export type CategoryId =
  | "work"
  | "university"
  | "everyday"
  | "shopping"
  | "social"
  | "help";

export interface Category {
  id: CategoryId;
  title: string;
  blurb: string;
}

export interface Phrase {
  id: string;
  tr: string;
  /** Natural English equivalent. */
  en: string;
  /** Word-for-word meaning, only when it helps understanding. */
  literal?: string;
  register: Register;
  usage: string;
  example?: { tr: string; en: string };
}

export interface DialogueLine {
  speaker: string;
  tr: string;
  en: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  category: CategoryId;
  title: string;
  summary: string;
  situation: string;
  minutes: number;
  phrases: Phrase[];
  dialogue: DialogueLine[];
  quiz: QuizQuestion[];
}

/** best = most natural, good = works fine, off = does not fit. */
export type Fit = "best" | "good" | "off";

export interface ScenarioOption {
  tr: string;
  en: string;
  fit: Fit;
  why: string;
}

export interface ScenarioStep {
  id: string;
  speaker: string;
  tr: string;
  en: string;
  options: ScenarioOption[];
}

export interface Scenario {
  id: string;
  title: string;
  setting: string;
  level: string;
  steps: ScenarioStep[];
}
