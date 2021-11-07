import { ProductEntity } from 'src/database';
import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  amountAvailable: number;

  @ApiProperty()
  cost: number;

  @ApiProperty()
  sellerId: number;

  constructor(entity: ProductEntity) {
    Object.assign(this, { ...entity });
  }
}
