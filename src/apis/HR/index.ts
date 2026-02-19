import { request } from '@/utils/request';
import type { ApiResponse } from '../types';
import type { Candidate, JobProfile } from './type';

export const getJobDashboard = (params?: { position?: string; status?: string }) => {
  return request({
    url: '/hr/dashboard/candidates',
    method: 'GET',
    params,
  }) as Promise<ApiResponse<Candidate[]>>;
};

export const getTalentReport = (id: string) => {
  return request({
    url: `/hr/talent/${id}`,
    method: 'GET',
  }) as Promise<ApiResponse<any>>;
};

export const getJobProfiles = () => {
  return request({
    url: '/hr/job-profiles',
    method: 'GET',
    params: {
      timestamp: Date.now() // Prevent caching
    }
  }) as Promise<ApiResponse<JobProfile[]>>;
};

export const updateJobProfile = (data: JobProfile) => {
  return request({
    url: `/hr/job-profiles/${data.id}`,
    method: 'PUT',
    data,
  }) as Promise<ApiResponse<void>>;
};

export const createJobProfile = (data: Omit<JobProfile, 'id'>) => {
  return request({
    url: '/hr/job-profiles',
    method: 'POST',
    data,
  }) as Promise<ApiResponse<JobProfile>>;
};
