export interface LoginParams {
  email?: string;
  password?: string;
  type?: 'seeker' | 'hr';
}

export interface UserInfo {
  token: string;
  username: string;
  email: string;
}
