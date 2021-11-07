import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CommonModule, GlobalExceptionFilter } from 'src/common';
import { ConfigModule } from 'src/config';
import { DatabaseModule } from 'src/database';
import { AuthModule } from 'src/features/auth';
import { UserModule } from 'src/features/users';
import { ProductModule } from 'src/features/products';
import { StoreModule } from 'src/features/store';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    ProductModule,
    StoreModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
