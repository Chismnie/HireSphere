import { uploadImage } from '@/apis/Common';
import { uploadResume as uploadPdf } from '@/apis/Common/Resume';

const upload = uploadImage;
export const ReqMap = {
  up: upload,
  img: uploadImage,
  pdf: uploadPdf,
};
