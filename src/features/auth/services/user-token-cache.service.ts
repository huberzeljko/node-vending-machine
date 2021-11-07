import * as moment from 'moment';
import { ConfigService } from 'src/config';
import { Injectable } from '@nestjs/common';

// in real scenario this would be managed by redis and not in memory
@Injectable()
export class UserTokenCacheService {
  private readonly expiredMap: { [key: number]: Date } = {};

  constructor(private readonly configService: ConfigService) {}

  isRevoked(userId: number, expires: Date): Promise<boolean> {
    const date = this.expiredMap[userId];
    return Promise.resolve(date && date > expires);
  }

  revoke(userId) {
    this.expiredMap[userId] = moment()
      .add(
        this.configService.get('security.jwt.expirationInSeconds'),
        'seconds',
      )
      .toDate();
  }
}
