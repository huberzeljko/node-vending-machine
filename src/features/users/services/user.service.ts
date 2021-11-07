import { Injectable } from '@nestjs/common';
import { CryptService } from 'src/common/services';
import { UserEntity } from 'src/database';
import { RegisterUserDto, UpdateUserDto, UserDto } from '../dtos';
import { ValidationError } from 'src/common';
import { ILike } from 'typeorm';
import { UserRepository } from 'src/database/repositories';

@Injectable()
export class UserService {
  constructor(
    private readonly cryptService: CryptService,
    private readonly userRepository: UserRepository,
  ) {}

  async getById(id: number): Promise<UserDto> {
    const user = await this.userRepository.findOne(id);
    return user ? new UserDto(user) : null;
  }

  getByName(username: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { username: ILike(username) },
    });
  }

  async register(model: RegisterUserDto): Promise<UserDto> {
    const { username, password, role } = model;
    if ((await this.getByName(username)) != null) {
      throw new ValidationError(
        'auth/register/username-already-exist',
        'Username already exists',
      );
    }

    const user = this.userRepository.create();
    user.password = await this.cryptService.hash(password);
    user.username = username;
    user.role = role;
    user.deposit = 0;

    return new UserDto(await this.userRepository.save(user));
  }

  async update(id: number, userDto: UpdateUserDto) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new ValidationError('auth/update/user-not-found', 'User not found');
    }

    if (userDto.username && userDto.username !== '') {
      const existingUser = await this.getByName(userDto.username);
      if (existingUser && existingUser.id !== user.id) {
        throw new ValidationError(
          'auth/update/username-already-exist',
          'Username already exists',
        );
      }

      user.username = userDto.username;
    }

    if (userDto.password) {
      user.password = await this.cryptService.hash(userDto.password);
    }

    await this.userRepository.save(user);
  }

  async removeById(id: number): Promise<boolean> {
    const result = await this.userRepository.delete({ id: id });
    return result.affected === 1;
  }
}
