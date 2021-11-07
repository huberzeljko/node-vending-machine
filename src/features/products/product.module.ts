import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from 'src/features/products/services';
import { DatabaseModule } from 'src/database';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
