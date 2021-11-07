export interface SecurityConfig {
  hashSaltOrRounds: string | number;
  jwt: JwtConfig;
  refreshToken: RefreshTokenConfig;
}

export interface JwtConfig {
  secret: string;
  expirationInSeconds: number;
  issuer?: string;
  audience?: string;
}

export interface RefreshTokenConfig {
  secret: string;
  durationInMinutes: number;
}
