import { UserEntity } from './user.entity';

export class ProductEntity {
  id: number;
  productName: string;
  amountAvailable: number;
  cost: number;
  sellerId: number;
  seller: UserEntity;
}
