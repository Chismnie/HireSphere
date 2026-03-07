import { request } from '@/utils/request';
import type { ApiResponse } from '@/apis/types';

export const getMockInterviewList = () => {
  return request({
    url: '/seeker/interview/list',
    method: 'GET',
  }) as Promise<ApiResponse<any[]>>;
};
