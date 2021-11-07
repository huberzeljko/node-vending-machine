import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './services';
import { AccessTokenDto, LoginRequestDto, LoginResponseDto, LogoutRequestDto, RefreshTokenRequestDto } from './dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public, User } from 'src/features/auth/decorators';
import { IpAddress } from 'src/common';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login user.' })
  @ApiResponse({ status: 200, description: 'Return access token.', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid username or password.' })
  @Post('login')
  @Public()
  async login(@Body() credentials: LoginRequestDto, @IpAddress() ipAddress: string): Promise<LoginResponseDto> {
    const { hasOtherSessions, refreshToken, accessToken } = await this.authService.login(credentials, ipAddress);
    const response: LoginResponseDto = {
      accessToken,
      refreshToken,
    };

    if (hasOtherSessions) {
      response.message = 'There is already an active session using your account';
    }

    return response;
  }

  @ApiOperation({ summary: 'Refresh token.' })
  @ApiResponse({ status: 200, description: 'Return new and refresh tokens.', type: AccessTokenDto })
  @ApiResponse({ status: 400, description: 'Invalid refresh token' })
  @Post('refresh-token')
  @Public()
  exchangeRefreshToken(@Body() model: RefreshTokenRequestDto, @IpAddress() ipAddress: string): Promise<AccessTokenDto> {
    return this.authService.exchangeRefreshToken(model.refreshToken, ipAddress);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user.' })
  @ApiResponse({ status: 200, description: 'User has been successfully logged out.' })
  @Post('logout')
  @Public()
  async logout(@Body() model: LogoutRequestDto) {
    return this.authService.logout(model);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user from all active sessions.' })
  @ApiResponse({ status: 200, description: 'User has been successfully logged out from all active sessions.' })
  @Post('logout/all')
  async logoutAll(@User('userId') userId: number) {
    return this.authService.logoutAllSessions(userId);
  }
}
