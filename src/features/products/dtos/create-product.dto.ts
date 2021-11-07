import { IsDivisibleBy, IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amountAvailable: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(5)
  @IsDivisibleBy(5)
  cost: number;
}
