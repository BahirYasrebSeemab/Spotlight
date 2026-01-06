export interface SignupForm {
  fullName: string;
  email: string;
  username: string;
  password: string;
  confirmPass: string;
  dob?: string | undefined;
}

export interface LoginForm {
  email: string;
  password: string;
}
