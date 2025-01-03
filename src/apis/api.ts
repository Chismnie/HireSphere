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
