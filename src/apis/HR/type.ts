export interface Candidate {
  id: string;
  name: string;
  position: string;
  matchScore: number;
  status: 'pending' | 'interviewed' | 'accepted' | 'rejected';
  tags: string[];
}

export interface Indicator {
  id: string;
  name: string;
  value: number;
  category: string;
  isCustom?: boolean;
}

export interface JobProfile {
  id: string;
  name: string;
  indicators: Indicator[];
  redLines: string[];
  aiSuggestion: string;
}
