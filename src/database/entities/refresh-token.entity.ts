import { UserEntity } from 'src/database/entities/user.entity';

export class RefreshTokenEntity {
  id: number;
  token: string;
  expires: Date;
  remoteIpAddress: string;
  userId: number;
  user: UserEntity;
}
