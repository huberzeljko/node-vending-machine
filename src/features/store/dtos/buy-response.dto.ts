import { ApiProperty } from '@nestjs/swagger';

export type CentCoins = 5 | 10 | 20 | 50 | 100;

export class BuyResponseDto {
  @ApiProperty()
  totalSpent: number;

  @ApiProperty()
  product: string;

  @ApiProperty()
  coinChange: number[];
}
