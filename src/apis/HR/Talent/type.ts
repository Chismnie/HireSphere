// HR Talent Types
export interface Talent {
  talent_id: string;
  full_name: string;
  target_position: string;
  match_score: number;
  interview_status: string;
  core_advantages: string;
  hire_status: string;
  created_at: string;
}

export interface TalentListResponse {
  list: Talent[];
}

export interface InterviewedTalent extends Talent {
  interview_time: number;
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  matchScore: number;
  status: 'pending' | 'interviewed' | 'accepted' | 'rejected';
  tags: string[];
}
