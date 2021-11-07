import { UserDto } from './user.dto';
import { AccessTokenDto } from 'src/features/auth';

export class RegisterResultDto {
  user: UserDto;
  token: AccessTokenDto;
}