import { IsEnum, IsLowercase, IsNotEmpty, Length, Matches } from 'class-validator';
import { Role } from 'src/database';
import { ApiProperty } from '@nestjs/swagger';

const USERNAME_REG_EXP = new RegExp(
  '^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$',
);

export class RegisterUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(4, 20, { message: 'Username should be between 4 and 20 characters' })
  @Matches(USERNAME_REG_EXP, { message: 'Username can contain alphanumeric characters and dot/underscore. Dot/underscore can\'t be at start/end and should not be used multiple times in a row.'})
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6)
  password: string;

  @ApiProperty({ enum: Role })
  @IsNotEmpty()
  @IsEnum(Role, { message: 'Specified role doesn\'t exist.' })
  role: Role;
}
