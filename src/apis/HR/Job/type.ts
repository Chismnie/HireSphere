// HR Job Types
export interface Competency {
  name: string;
  type: string;
  weight: number;
}

export interface JobProfileData {
  job_profile_id?: string;
  job_title?: string;
  competencies?: Competency[];
  red_line_condition?: string[];
  ai_adjustment_suggestion?: string;
  created_at?: string;
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
