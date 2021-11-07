import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from 'src/features/products/dtos/create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
