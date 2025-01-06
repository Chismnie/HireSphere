import { upload, uploadImage, uploadPdf } from "../apis/api";
export const reqMap = {
  up: upload,
  img: uploadImage,
  pdf: uploadPdf,
};
