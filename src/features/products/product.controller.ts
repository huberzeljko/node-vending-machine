import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './services';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public, Roles, User } from 'src/features/auth';
import { IsUserCreatorGuard, NotFoundInterceptor } from 'src/common';
import {
  CreateProductDto,
  ProductDto,
  ProductFilterDto,
  ProductSearchResultDto,
  UpdateProductDto
} from 'src/features/products/dtos';
import { Role } from 'src/database';
import { ProductRepository } from 'src/database/repositories';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Query products.' })
  @ApiResponse({ status: 200, description: 'Return product list.', type: ProductSearchResultDto })
  @ApiResponse({ status: 400, description: 'Invalid filter data.' })
  @Get()
  @Public()
  find(@Query() filter: ProductFilterDto) {
    return this.productService.find(filter);
  }

  @ApiOperation({ summary: 'Get product.' })
  @ApiResponse({ status: 200, description: 'Return product.', type: ProductDto })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @Get(':id')
  @UseInterceptors(new NotFoundInterceptor('Product with specified id not found'))
  @Public()
  getById(@Param('id') id: number) {
    return this.productService.getById(id);
  }

  @ApiOperation({ summary: 'Create product.' })
  @ApiResponse({ status: 201, description: 'Product has been successfully created.', type: ProductDto })
  @ApiResponse({ status: 403, description: 'User is not allowed to create product.' })
  @ApiResponse({ status: 400, description: 'Invalid product data' })
  @Post()
  @Roles(Role.Seller)
  create(@User('userId') userId: number, @Body() data: CreateProductDto) {
    return this.productService.create(data, userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product.' })
  @ApiResponse({ status: 201, description: 'Product has been successfully updated.' })
  @ApiResponse({ status: 403, description: 'User is not allowed to update product.' })
  @ApiResponse({ status: 404, description: 'Product with specified id not found.' })
  @ApiResponse({ status: 400, description: 'Invalid product data.' })
  @Put(':id')
  @Roles(Role.Seller)
  @UseGuards(IsUserCreatorGuard(ProductRepository, 'sellerId'))
  update(@Param('id') id: number, @Body() data: UpdateProductDto) {
    return this.productService.update(id, data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product.' })
  @ApiResponse({ status: 201, description: 'Product has been successfully delete.' })
  @ApiResponse({ status: 403, description: 'User is not allowed to delete product.' })
  @ApiResponse({ status: 404, description: 'Product with specified id not found.' })
  @ApiResponse({ status: 400, description: 'Invalid product data.' })
  @Delete(':id')
  @Roles(Role.Seller)
  @UseGuards(IsUserCreatorGuard(ProductRepository, 'sellerId'))
  async removeById(@Param('id') id: number) {
    await this.productService.removeById(id);
  }
}



