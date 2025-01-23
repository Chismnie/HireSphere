//api.ts
/**
 * 请求头里面加上 pop: true 表示是需要加入控制并发请求队列
 */
import { request, fetchReader } from "../utils/request";
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
      pop: true,
    },
  });
};
//上传pdf
export const uploadPdf = (file: File) => {
  const formData = new FormData();
  formData.append("pdf", file); // 将文件添加到 FormData 中
  return request({
    url: "/upload-pdf",
    data: formData,
    method: "POST",
    Headers: {
      "Content-Type": "multipart/form-data",
      pop: true,
    },
  });
};
//sse
export const getFetchSse = () => {
  return fetchReader("/stream", {
    method: "GET",
  });
};
