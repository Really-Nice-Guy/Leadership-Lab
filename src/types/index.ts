export interface Article {
  number: number;
  title: string;
  date: string;
  topics: string[];
  sessions: string[];
  relevance: Record<string, string>;
  content?: string;
  inCurriculum?: boolean;
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
