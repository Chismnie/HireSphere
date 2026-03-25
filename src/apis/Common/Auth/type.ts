export interface LoginParams {
  email?: string;
  password?: string;
  type?: 'seeker' | 'hr';
}

export interface RegisterParams {
  username: string;
  email: string;
  password?: string;
  type: 'seeker' | 'hr';
  code: string;
}

export interface UserInfo {
  token: string;
  username: string;
  email: string;
}
