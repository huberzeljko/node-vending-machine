import { Injectable } from '@nestjs/common';
import { RefreshTokenEntity, UserEntity } from 'src/database';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, TokenPayload } from 'src/features/auth/interfaces';
import { CryptService } from 'src/common/services';
import { randomBytes } from 'crypto';
import * as moment from 'moment';
import { ConfigService } from 'src/config';
import { UserTokenCacheService } from './user-token-cache.service';
import { use } from 'passport';
import { Not } from 'typeorm';
import { ValidationError } from 'src/common';
import { RefreshTokenRepository } from 'src/database/repositories';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cryptService: CryptService,
    private readonly configService: ConfigService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userTokenCacheService: UserTokenCacheService,
  ) {}

  generateAccessToken(user: UserEntity): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return Promise.resolve(this.jwtService.sign(payload));
  }

  async addRefreshToken(
    userId: number,
    ipAddress: string,
  ): Promise<RefreshTokenEntity> {
    const refreshToken = randomBytes(64).toString('hex');

    const entity = this.refreshTokenRepository.create();
    entity.token = refreshToken;
    entity.userId = userId;
    entity.remoteIpAddress = ipAddress;
    entity.expires = moment()
      .add(
        this.configService.get('security.refreshToken.durationInMinutes'),
        'minutes',
      )
      .toDate();

    return await this.refreshTokenRepository.save(entity);
  }

  removeRefreshToken(token: RefreshTokenEntity) {
    return this.refreshTokenRepository.remove(token);
  }

  getUserSessionCount(userId: number, ipAddress: string) {
    return this.refreshTokenRepository.count({
      where: {
        userId: userId,
        remoteIpAddress: Not(ipAddress),
      },
    });
  }

  async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenEntity | null> {
    const currentRefreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    const now = moment().toDate();
    if (!currentRefreshToken || currentRefreshToken.expires < now) {
      return null;
    }

    return currentRefreshToken;
  }

  async clearRefreshToken(refreshToken: string): Promise<void> {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (!tokenEntity) {
      throw new ValidationError(
        'auth/logout/invalid-refresh-token',
        'Refresh token is not valid',
      );
    }

    const userId = tokenEntity.userId;

    await this.refreshTokenRepository.remove(tokenEntity);
    await this.userTokenCacheService.revoke(userId);
  }

  async clearUserRefreshTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.delete({ userId: userId });
    await this.userTokenCacheService.revoke(userId);
  }

  async validate(payload: JwtPayload): Promise<TokenPayload> {
    const isRevoked = await this.userTokenCacheService.isRevoked(
      payload.sub,
      moment.unix(payload.exp).toDate(),
    );
    return isRevoked
      ? null
      : { userId: payload.sub, role: payload.role, username: payload.username };
  }
}
