export interface Article {
  number: number;
  date: string;
  title: string;
  content: string;
  category?: 'Technology/AI' | 'Macroeconomics' | 'Geopolitics' | 'Thought Leadership';
  fourC?: 'Communication' | 'Customer' | 'Cognizance' | 'Charisma' | null;
  sessions?: string[];
  shelfLife?: 'dated' | 'ageless';
}

export interface SessionResource {
  title: string;
  url: string;
  source?: string;
}

export interface Introspection {
  title: string;
  prompts: string[];
}

export interface Session {
  id: string;
  name: string;
  day: number;
  time: string;
  fourC: 'Communication' | 'Customer' | 'Cognizance' | 'Charisma';
  coreTopics: string[];
  articles: number[];
  hasContent: boolean;
  emptyReason?: string;
  description?: string;
  discussionPoints?: string[];
  introspections?: Introspection[];
  resources?: SessionResource[];
}

export type FourCCategory = 'Communication' | 'Customer' | 'Cognizance' | 'Charisma';

export interface Mapping {
  [key: string]: number[];
}