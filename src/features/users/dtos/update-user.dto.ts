import { OmitType, PartialType } from '@nestjs/swagger';
import { RegisterUserDto } from 'src/features/users/dtos/register-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(RegisterUserDto, ['role'] as const),
) {}
