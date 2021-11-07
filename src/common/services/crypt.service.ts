import { hash, compare } from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config';

@Injectable()
export class CryptService {
  constructor(private readonly configService: ConfigService) {}

  hash(plain: string) {
    return hash(plain, this.configService.get('security').hashSaltOrRounds);
  }

  compareHash(plain: string, hashed: string) {
    return compare(plain, hashed);
  }
}
