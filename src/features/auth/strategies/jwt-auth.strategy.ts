import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from 'src/config';
import { JwtPayload, TokenPayload } from '../interfaces';
import { TokenService } from 'src/features/auth/services';
import * as moment from 'moment';

export const jwtStrategyName = 'jwt';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(
  Strategy,
  jwtStrategyName,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('security.jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<TokenPayload> {
    const result = await this.tokenService.validate(payload);
    if (!result) {
      throw new UnauthorizedException();
    }

    return result;
  }
}