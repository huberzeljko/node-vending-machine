import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export function PagedSearchResultDto<T>(classRef: Type<T>) {
  class Paginated {
    @ApiProperty({ type: [classRef] })
    items: T[];

    @ApiProperty()
    totalCount: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    pageSize: number;
  }

  return Paginated as any;
}