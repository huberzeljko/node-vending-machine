import { Config, Environment } from './interfaces';

export default (): Config => {
  const PORT = process.env.PORT || '3000';

  let saltOrRounds: string | number = process.env.SECURITY_HASH_SALT_OR_ROUNDS;
  if (typeof saltOrRounds === 'string') {
    const rounds = parseInt(saltOrRounds);
    if (!isNaN(rounds)) {
      saltOrRounds = rounds;
    }
  }

  return {
    baseUrl: '',
    port: parseInt(PORT),
    environment: process.env.NODE_ENV as Environment,
    database: {
      host: process.env.HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
    },
    security: {
      hashSaltOrRounds: saltOrRounds,
      jwt: {
        secret: process.env.SECURITY_JWT_SECRET,
        expirationInSeconds: 10 * 60, // 10 minutes
        issuer: `http://localhost:${PORT}`,
        audience: `http://localhost:${PORT}`,
      },
      refreshToken: {
        secret: process.env.SECURITY_REFRESH_TOKEN_SECRET,
        durationInMinutes: 15 * 24 * 60, // 30 days
      },
    },
  };
};
