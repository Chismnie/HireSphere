//api.js
import { request } from "../utils/request";

export const login = (data: object) => {
  return request({
    url: "/login",
    params: data,
    method: "GET",
  });
};

export const upload = (id: number) => {
  return request({
    url: `/home/${id}`,
    method: "GET",
  });
};

export const uploadImage = (data: File) => {
  const formData = new FormData();
  formData.append("image", data); // 将文件添加到 FormData 中
  return request({
    url: "/upload",
    data: formData,
    method: "POST",
    Headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
//上传pdf
export const uploadPdf = (file: File) => {
  const formData = new FormData();
  formData.append("pdf", file); // 将文件添加到 FormData 中
  console.log("上传ing");
  return request({
    url: "/upload-pdf",
    data: formData,
    method: "POST",
    Headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
