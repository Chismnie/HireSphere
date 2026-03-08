import { request } from '@/utils/request';
import type { UploadResumeResponse } from './type';

export * from './type';

// POST api/v1/resume/upload
export const uploadResume = (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  return request({
    url: '/api/v1/resume/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
