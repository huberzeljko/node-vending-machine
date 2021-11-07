import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule as BaseJwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from 'src/config';
import { AuthService, TokenService, UserTokenCacheService } from './services';
import { JwtAuthStrategy } from './strategies';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard, RolesGuard } from './guards';
import { CommonModule } from 'src/common';
import { DatabaseModule } from 'src/database';

const JwtModule = BaseJwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => {
    const jwtConfig = config.get('security.jwt');

    return {
      secret: jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expirationInSeconds,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      },
    };
  },
  inject: [ConfigService],
});

@Module({
  imports: [
    CommonModule,
    ConfigModule,
    PassportModule,
    JwtModule,
    DatabaseModule,
  ],
  controllers: [AuthController],
  providers: [
    TokenService,
    AuthService,
    UserTokenCacheService,
    JwtAuthStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [TokenService, AuthService, UserTokenCacheService],
})
export class AuthModule {}
