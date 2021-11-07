import { ProductEntity } from './product.entity';
import { RefreshTokenEntity } from 'src/database/entities/refresh-token.entity';

export enum Role {
  Buyer = 'BUYER',
  Seller = 'SELLER',
}

export class UserEntity {
  id: number;
  username: string;
  password: string;
  role: Role;
  deposit: number;
  products: ProductEntity[];
  refreshTokens: RefreshTokenEntity[];
}
