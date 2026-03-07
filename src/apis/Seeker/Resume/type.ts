// Seeker Resume Types
export interface ResumeDiagnosisData {
  score: number;
  targetPosition: string;
  coreCompetency: string;
  riskPoint: string;
  quantSuggestion: string;
  aiSuggestions: {
    original: string;
    suggestion: string;
  }[];
}
