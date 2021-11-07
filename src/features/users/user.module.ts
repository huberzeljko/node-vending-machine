import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services';
import { CommonModule } from 'src/common';
import { AuthModule, AuthService } from 'src/features/auth';
import { DatabaseModule } from 'src/database';

@Module({
  imports: [
    CommonModule,
    forwardRef(() => AuthModule),
    DatabaseModule
  ],
  controllers: [UserController],
  providers: [UserService, AuthService],
  exports: [UserService],
})
export class UserModule {}
