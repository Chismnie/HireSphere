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
  success: boolean;
  // canJoin: boolean; // Removed based on new response format
  // interviewInfo: InterviewInfo; // Removed based on new response format
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

export interface ConnectionResponse {
  ws_url: string;
  ws_token?: string;
}
