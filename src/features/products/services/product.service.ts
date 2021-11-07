import { Injectable } from '@nestjs/common';
import { CreateProductDto, ProductDto, ProductFilterDto, ProductSearchResultDto, UpdateProductDto, } from '../dtos';
import { ProductRepository } from 'src/database/repositories';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async find(filter: ProductFilterDto): Promise<ProductSearchResultDto> {
    const query = this.productRepository.createQueryBuilder('product');
    if (filter.searchQuery && filter.searchQuery !== '') {
      query.where('product.productName ILIKE :search', {
        search: filter.searchQuery,
      });
    }

    const [products, count] = await query
      .skip((filter.page - 1) * filter.pageSize)
      .take(filter.pageSize)
      .getManyAndCount();

    return {
      items: products.map((product) => new ProductDto(product)),
      totalCount: count,
      page: filter.page,
      pageSize: filter.pageSize,
    };
  }

  async getById(id: number): Promise<ProductDto> {
    const product = await this.productRepository.findOne(id);
    return product ? new ProductDto(product) : null;
  }

  async create(
    productDto: CreateProductDto,
    sellerId: number,
  ): Promise<ProductDto> {
    const product = this.productRepository.create();
    product.productName = productDto.productName;
    product.cost = productDto.cost;
    product.amountAvailable = productDto.amountAvailable;
    product.sellerId = sellerId;

    const savedProduct = await this.productRepository.save(product);

    return savedProduct ? new ProductDto(savedProduct) : null;
  }

  async update(id: number, productDto: UpdateProductDto) {
    await this.productRepository.update(id, { ...productDto });
  }

  async removeById(id: number): Promise<boolean> {
    return (await this.productRepository.delete({ id: id })).affected > 0;
  }
}