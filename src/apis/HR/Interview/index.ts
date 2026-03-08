import { request } from '@/utils/request';
import type { ApiResponse } from '@/apis/types';
import type { InterviewInfo, CheckPermissionResponse, CreateInterviewResponse, AddTagParams, AiSuggestionParams, AiSuggestionResponse, ConnectionResponse } from './type';

export * from './type';

export const validateInterview = async (roomId: string, token: string): Promise<InterviewInfo> => {
  const res = await request({
    url: '/api/v1/interview/check_room_permission',
    method: 'POST',
    // 同时通过 query 和 header 传递 token，以兼容后端不同校验方式
    params: {
        token: token
    },
    data: {
      room_id: roomId,
    },
    headers: {
      Authorization: `Bearer ${token}`
    }
  }) as ApiResponse<CheckPermissionResponse>;

  if (res.code === 200 && res.data && res.data.success) {
      return {
          id: roomId,
          roomId: roomId,
          company: 'HireSphere', 
          position: 'AI 面试', 
          candidateName: '候选人', 
          interviewer: '面试官', 
          startTime: new Date().toISOString(),
          token: token
      };
  }

  throw new Error(res.message || '无法进入面试间：权限验证失败');
};

// 新建面试房间
export const createInterviewRoom = async (talentId: string): Promise<ApiResponse<CreateInterviewResponse>> => {
  return request({
    url: '/api/v1/interview/create',
    method: 'POST',
    data: {
      talent_id: talentId
    }
  }) as Promise<ApiResponse<CreateInterviewResponse>>;
};

// 给消息打标签
export const addMessageTag = (params: AddTagParams) => {
  return request({
    url: '/api/v1/interview/message/add_tag',
    method: 'POST',
    data: params,
  }) as Promise<ApiResponse<void>>;
};

// 获取 AI 追问建议
export const getAiSuggestion = (params: AiSuggestionParams): Promise<ApiResponse<AiSuggestionResponse>> => {
  return request({
    url: '/api/v1/interview/message/ai_suggestion',
    method: 'POST',
    data: params,
  }) as Promise<ApiResponse<AiSuggestionResponse>>;
};
