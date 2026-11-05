export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  status: string;
  role: string;
  currency: string;
  timezone: string;
}

export interface AuthMeResponse {
  user: User;
  workspaces: Workspace[];
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  gym_name: string;
  gym_slug: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status: string;
}

export interface MemberPayload {
  member_number: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
}

export interface BranchPayload {
  name: string;
  code: string;
  address?: string | null;
}