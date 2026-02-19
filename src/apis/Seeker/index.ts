import { request } from '@/utils/request';
import type { ApiResponse } from '../types';
import type { ResumeUploadResponse, ResumeDiagnosisData } from './type';

export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/seeker/resume/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }) as Promise<ApiResponse<ResumeUploadResponse>>;
};

export const getResumeDiagnosis = () => {
  return request({
    url: '/seeker/resume/diagnosis',
    method: 'GET',
  }) as Promise<ApiResponse<ResumeDiagnosisData>>;
};

export const getMockInterviewList = () => {
  return request({
    url: '/seeker/interview/list',
    method: 'GET',
  }) as Promise<ApiResponse<any[]>>;
};

export const getGrowthTrack = () => {
  return request({
    url: '/seeker/growth/track',
    method: 'GET',
  }) as Promise<ApiResponse<any>>;
};
