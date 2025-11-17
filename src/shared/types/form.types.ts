export interface SignupForm {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPass: string;
  avatar: string;
  dob?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}
