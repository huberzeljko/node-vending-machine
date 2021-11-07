import { ProductController } from 'src/features/products/product.controller';
import { ProductService } from 'src/features/products/services';
import { Test } from '@nestjs/testing';
import {
  CreateProductDto,
  ProductDto,
  ProductFilterDto,
  ProductSearchResultDto,
} from 'src/features/products/dtos';
import { ProductEntity, UserEntity } from 'src/database';
import { ProductRepository } from 'src/database/repositories';

const getProduct = (): ProductEntity => ({
  id: 1,
  productName: 'Chips',
  amountAvailable: 10,
  cost: 10,
  seller: null as UserEntity,
  sellerId: 1,
});

describe('ProductController', () => {
  let productController: ProductController;
  let productService: ProductService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [],
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useFactory: () => ({
            getById: jest.fn().mockResolvedValue(getProduct()),
            create: jest.fn().mockResolvedValue(getProduct()),
            update: jest.fn().mockResolvedValue(true),
            removeById: jest.fn().mockResolvedValue(true),
            find: jest.fn().mockImplementation((filter: ProductFilterDto) => ({
              totalCount: 2,
              page: filter.page,
              pageSize: filter.pageSize,
              items: [
                {
                  id: 1,
                  productName: 'Chips',
                  amountAvailable: 10,
                  cost: 10,
                  seller: null as UserEntity,
                  sellerId: 1,
                },
                {
                  id: 2,
                  productName: 'Chips 2',
                  amountAvailable: 10,
                  cost: 10,
                  seller: null as UserEntity,
                  sellerId: 2,
                },
              ],
            })),
          }),
        },
        {
          provide: ProductRepository,
          useFactory: () => ({
            findOne: jest.fn().mockResolvedValue(getProduct()),
          }),
        },
      ],
    }).compile();

    productController = moduleRef.get<ProductController>(ProductController);
    productService = moduleRef.get<ProductService>(ProductService);
    jest.clearAllMocks();
  });

  describe('GET /products/:id', () => {
    describe('when getProduct is called', () => {
      let product: ProductDto;

      beforeEach(async () => {
        product = await productController.getById(getProduct().id);
      });

      test('then it should call productService', () => {
        expect(productService.getById).toBeCalledWith(getProduct().id);
      });

      test('then is should return a product', () => {
        expect(product).toEqual(getProduct());
      });
    });
  });

  describe('GET /products', () => {
    describe('when queryProducts is called', () => {
      let result: ProductSearchResultDto;
      const filter: ProductFilterDto = {
        page: 1,
        pageSize: 100,
      };

      beforeEach(async () => {
        result = await productController.find(filter);
      });

      test('then it should call usersService', () => {
        expect(productService.find).toHaveBeenCalledWith(filter);
      });

      test('then it should return users', () => {
        expect(result).toEqual({
          totalCount: 2,
          page: 1,
          pageSize: 100,
          items: [
            {
              id: 1,
              productName: 'Chips',
              amountAvailable: 10,
              cost: 10,
              seller: null as UserEntity,
              sellerId: 1,
            },
            {
              id: 2,
              productName: 'Chips 2',
              amountAvailable: 10,
              cost: 10,
              seller: null as UserEntity,
              sellerId: 2,
            },
          ],
        });
      });
    });
  });

  describe('POST /products', () => {
    describe('when createProduct is called', () => {
      let product: ProductDto;
      let createProductDto: CreateProductDto;
      const userId = 1;

      beforeEach(async () => {
        createProductDto = { ...getProduct() };
        product = await productController.create(userId, createProductDto);
      });

      test('then it should call productService', () => {
        expect(productService.create).toHaveBeenCalledWith(
          {
            ...createProductDto,
          },
          userId,
        );
      });

      test('then it should return a product', () => {
        expect(product).toEqual(getProduct());
      });
    });
  });

  describe('PUT /product:/id', () => {
    describe('when updateProduct is called', () => {
      const updateProductDto = {
        cost: 10,
        productName: 'Chips',
        amountAvailable: 3,
      };

      beforeEach(async () => {
        await productController.update(getProduct().id, updateProductDto);
      });

      test('then it should call productService', () => {
        expect(productService.update).toHaveBeenCalledWith(
          getProduct().id,
          updateProductDto,
        );
      });
    });
  });

  describe('DELETE /product:/id', () => {
    describe('when deleteProduct is called', () => {
      const product = getProduct();

      beforeEach(async () => {
        await productController.removeById(product.id);
      });

      test('then it should call productService', () => {
        expect(productService.removeById).toHaveBeenCalledWith(product.id);
      });
    });
  });
});
