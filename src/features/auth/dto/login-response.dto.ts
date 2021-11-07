import { AccessTokenDto } from 'src/features/auth/dto/access-token.dto';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto extends AccessTokenDto {
  @ApiProperty({ required: false })
  message?: string;
}