import { Body, Controller, Delete, Get, Post, Put, UseInterceptors, } from '@nestjs/common';
import { UserService } from './services';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, } from '@nestjs/swagger';
import { RegisterResultDto, RegisterUserDto, UpdateUserDto, UserDto } from 'src/features/users/dtos';
import { IpAddress, NotFoundInterceptor } from 'src/common';
import { Public, User } from 'src/features/auth/decorators';
import { AuthService } from 'src/features/auth';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get currently logged in user.' })
  @ApiResponse({ status: 200, description: 'Return user.', type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Get()
  @UseInterceptors(new NotFoundInterceptor('User with specified id not found'))
  async getById(@User('userId') id: number) {
    return this.userService.getById(id);
  }

  @ApiOperation({ summary: 'Create User.' })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully created.',
    type: RegisterResultDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid user data' })
  @Public()
  @Post()
  async create(@Body() data: RegisterUserDto, @IpAddress() ipAddress: string) {
    const user = await this.userService.register(data);
    const { accessToken, refreshToken } = await this.authService.login(
      { username: user.username, password: data.password },
      ipAddress,
    );

    const result: RegisterResultDto = {
      user: user,
      token: { accessToken, refreshToken },
    };

    return result;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update currently logged in user.' })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully updated.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not allowed to update user.',
  })
  @ApiResponse({
    status: 404,
    description: 'User with specified id not found.',
  })
  @ApiResponse({ status: 400, description: 'Invalid user data.' })
  @Put()
  update(@User('userId') id: number, @Body() data: UpdateUserDto) {
    return this.userService.update(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user.' })
  @ApiResponse({
    status: 201,
    description: 'User has been successfully delete.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not allowed to delete user.',
  })
  @ApiResponse({
    status: 404,
    description: 'User with specified id not found.',
  })
  @ApiResponse({ status: 400, description: 'Invalid user data.' })
  @Delete()
  async removeById(@User('userId') id: number) {
    await this.userService.removeById(id);
  }
}
