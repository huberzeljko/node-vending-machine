import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from 'src/features/store/services';
import { UserModule } from 'src/features/users';
import { ProductModule } from 'src/features/products';
import { DatabaseModule } from 'src/database';

@Module({
  imports: [
    UserModule,
    ProductModule,
    DatabaseModule
  ],
  controllers: [StoreController],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
