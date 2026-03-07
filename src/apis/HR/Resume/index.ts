import { request } from '@/utils/request';
import type { GetResumeUrlResponse } from './type';

export * from './type';

// GET api/v1/resume/get_url
export const getResumeUrl = (talentId: string) => {
  return request({
    url: '/api/v1/resume/get_url',
    method: 'GET',
    params: { talent_id: talentId },
  });
};
