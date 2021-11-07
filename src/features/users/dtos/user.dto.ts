import { UserEntity } from 'src/database';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  constructor(entity: UserEntity) {
    const { password, ...fields } = entity;
    Object.assign(this, { ...fields });
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  deposit: number;
}
