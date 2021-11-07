import { ProductRepository } from 'src/database/repositories';
import { Test } from '@nestjs/testing';
import { ProductService } from 'src/features/products/services';
import { ProductEntity, UserEntity } from 'src/database';
import { UpdateProductDto } from 'src/features/products/dtos';

const getProduct = (): ProductEntity => ({
  id: 1,
  productName: 'Chips',
  amountAvailable: 10,
  cost: 10,
  seller: null as UserEntity,
  sellerId: 1,
});

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: ProductRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useFactory: () => ({
            findOne: jest
              .fn()
              .mockImplementation((id: number) =>
                Promise.resolve(id < 0 ? null : { ...getProduct(), id }),
              ),
            save: jest
              .fn()
              .mockImplementation((product) => ({ ...product, id: 1 })),
            create: jest.fn().mockResolvedValue(new ProductEntity()),
            update: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          }),
        },
      ],
    }).compile();

    productService = module.get(ProductService);
    productRepository = module.get(ProductRepository);
  });

  test('should be defined', () => {
    expect(productService).toBeDefined();
  });

  //describe('find', () => {});

  describe('getById', () => {
    describe('when get by id is called with invalid product identifier', () => {
      test('then it should return null', async () => {
        const product = await productService.getById(-1);
        expect(product).toBeNull();
      });
    });

    describe('when get by id is called with valid arguments', () => {
      test('then it should return product', async () => {
        const repoSpy = jest.spyOn(productRepository, 'findOne');

        const product = await productService.getById(getProduct().id);
        expect(repoSpy).toBeCalledWith(getProduct().id);
        expect(product.id).toEqual(getProduct().id);
      });
    });
  });

  describe('create', () => {
    describe('when create product is called', () => {
      test('then it should return product', async () => {
        const sellerId = 1;
        const createDto = {
          productName: 'Chips',
          amountAvailable: 1,
          cost: 10,
        };
        const product = await productService.create(createDto, sellerId);

        expect(product).toEqual({
          ...createDto,
          sellerId,
          id: 1,
        });
      });
    });
  });

  describe('update', () => {
    describe('when update product is called', () => {
      test('then it should call product repository', async () => {
        const repoSpy = jest.spyOn(productRepository, 'update');
        const updateDto: UpdateProductDto = {
          amountAvailable: 1,
          productName: 'Cola',
          cost: 20,
        };

        await productService.update(getProduct().id, updateDto);
        expect(repoSpy).toBeCalledWith(getProduct().id, updateDto);
      });
    });
  });

  describe('removeById', () => {
    describe('when delete product is called', () => {
      test('then it should call product repository', async () => {
        const repoSpy = jest.spyOn(productRepository, 'delete');
        const result = await productService.removeById(getProduct().id);
        expect(repoSpy).toBeCalledWith({ id: getProduct().id });
        expect(result).toBe(true);
      });
    });
  });
});
