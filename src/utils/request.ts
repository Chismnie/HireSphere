//utils.js
import axios from "axios";
axios.defaults.baseURL = "http://127.0.0.1:3005";
const axiosInstance = axios.create({
  timeout: 5 * 1000, // 请求超时时间（5秒）
});

export const request = (options: object) => {
  return new Promise((resolve, reject) => {
    axiosInstance(options)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};
