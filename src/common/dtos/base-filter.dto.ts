import { IsIn, IsInt, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BaseFilterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => String)
  searchQuery?: string;
}
