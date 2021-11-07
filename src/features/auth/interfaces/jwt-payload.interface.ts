export interface JwtPayload {
  sub: number;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;

  username: string;
  role: string;
}
