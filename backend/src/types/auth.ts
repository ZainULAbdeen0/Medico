export interface AuthPayload {
  userId: string;
  role: string;
  name: string;
  iat?: number;
  exp?: number;
}