export interface ApiResponse<T = any> {
  code?: number;
  Code?: number;
  data?: T;
  Data?: T;
  message?: string;
  Msg?: string;
}
