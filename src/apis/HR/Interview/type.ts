// 面试相关类型
export interface InterviewInfo {
  id: string;
  interviewer: string;
  company: string;
  position: string;
  candidateName: string;
  startTime: string;
  talentId?: string;
  roomId?: string;
  token?: string;
}

export interface CheckPermissionResponse {
  canJoin: boolean;
  role: 'hr' | 'seeker';
  interviewInfo: InterviewInfo;
}

export interface CreateInterviewResponse {
  room_id: string;
  talent_token: string;
}

export interface AddTagParams {
  message_id: string;
  room_id: string;
  tag: string;
}

export interface AiSuggestionParams {
  room_id: string;
  context: string; // 之前对话的上下文
}

export interface AiSuggestionResponse {
  text: string;
}
