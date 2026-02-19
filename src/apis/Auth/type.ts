export interface LoginParams {
  username: string;
  password?: string;
  email?: string;
  role?: 'seeker' | 'hr';
}

export interface UserInfo {
  token: string;
  role: 'seeker' | 'hr';
  username: string;
  avatar?: string;
  company?: string;
}
