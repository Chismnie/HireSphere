export interface ResumeUploadResponse {
  fileId: string;
  fileName: string;
  uploadTime: string;
}

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
