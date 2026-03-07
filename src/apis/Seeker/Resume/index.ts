import { request } from '@/utils/request';
import type { ApiResponse } from '@/apis/types';
import type { ResumeDiagnosisData } from './type';

export * from './type';

// GET /seeker/resume/diagnosis
export const getResumeDiagnosis = () => {
  return request({
    url: '/seeker/resume/diagnosis',
    method: 'GET',
  }) as Promise<ApiResponse<ResumeDiagnosisData>>;
};
