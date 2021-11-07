import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const VALID_DEPOSIT_COINS = [5, 10, 20, 50, 100] as const;

export class DepositDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsIn(VALID_DEPOSIT_COINS)
  value: number;
}
