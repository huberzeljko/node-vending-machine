import { Injectable } from '@nestjs/common';
import { AccessTokenDto, LoginRequestDto, LogoutRequestDto } from '../dto';
import { TokenService } from './token.service';
import { ValidationError } from 'src/common';
import { UserRepository } from 'src/database/repositories';
import { CryptService } from 'src/common/services';
import { ILike } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly cryptService: CryptService,
  ) {}

  async login(
    credentials: LoginRequestDto,
    ipAddress: string,
  ): Promise<AccessTokenDto & { hasOtherSessions: boolean }> {
    const { username, password } = credentials;

    const user = await this.userRepository.findOne({ where: { username: ILike(username) }});
    if (!user || !(await this.cryptService.compareHash(password, user.password))) {
      throw new ValidationError(
        'auth/login/invalid-username-or-password',
        'Invalid username or password',
      );
    }

    const sessionCount = await this.tokenService.getUserSessionCount(
      user.id,
      ipAddress,
    );

    const refreshToken = await this.tokenService.addRefreshToken(
      user.id,
      ipAddress,
    );

    const token = await this.tokenService.generateAccessToken(user);

    return {
      accessToken: token,
      refreshToken: refreshToken.token,
      hasOtherSessions: sessionCount > 0,
    };
  }

  async exchangeRefreshToken(
    refreshToken: string,
    ipAddress: string,
  ): Promise<AccessTokenDto> {
    const tokenEntity = await this.tokenService.verifyRefreshToken(
      refreshToken,
    );
    if (tokenEntity === null) {
      throw new ValidationError(
        'verify-refresh-token/invalid-or-expire-refresh-token',
        'Refresh token is not valid or has expired.',
      );
    }

    const user = await this.userRepository.findOne(tokenEntity.userId);

    await this.tokenService.removeRefreshToken(tokenEntity);
    const newTokenEntity = await this.tokenService.addRefreshToken(
      user.id,
      ipAddress,
    );

    const token = await this.tokenService.generateAccessToken(user);

    return { accessToken: token, refreshToken: newTokenEntity.token };
  }

  logout(data: LogoutRequestDto): Promise<void> {
    return this.tokenService.clearRefreshToken(data.refreshToken);
  }

  logoutAllSessions(userId: number): Promise<void> {
    return this.tokenService.clearUserRefreshTokens(userId);
  }
}
