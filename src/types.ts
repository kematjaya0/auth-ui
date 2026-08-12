export type TokenPair = {
  token: string;
  refresh_token: string;
};

export type UserProfile = {
  id: string;
  email: string;
  roles: string[];
  createdAt: string;
};

export type Problem = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  violations?: unknown[];
};
