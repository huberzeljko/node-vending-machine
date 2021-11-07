import { StoreService } from 'src/features/store/services';
import { Test } from '@nestjs/testing';
import { ProductRepository, UserRepository } from 'src/database/repositories';
import { ProductEntity, Role, UserEntity } from 'src/database';
import { NotFoundError, ValidationError } from 'src/common';

const getProduct = (): ProductEntity => ({
  id: 1,
  productName: 'Chips',
  amountAvailable: 10,
  cost: 10,
  seller: null as UserEntity,
  sellerId: 1,
});

const getBuyer = (): UserEntity => ({
  id: 2,
  username: 'buyer',
  password: '',
  deposit: 0,
  role: Role.Buyer,
  refreshTokens: [],
  products: [],
});

describe('StoreService', () => {
  let userRepository: UserRepository;
  let productRepository: ProductRepository;
  let service: StoreService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: UserRepository,
          useFactory: () => ({
            save: jest.fn().mockResolvedValue(true),
            findOne: jest
              .fn()
              .mockImplementation((id: number) =>
                Promise.resolve(id < 0 ? null : { ...getBuyer(), id }),
              ),
          }),
        },
        {
          provide: ProductRepository,
          useFactory: () => ({
            findOne: jest
              .fn()
              .mockImplementation((id: number) =>
                Promise.resolve(id < 0 ? null : { ...getProduct(), id }),
              ),
            save: jest.fn().mockResolvedValue({ ...getProduct() }),
          }),
        },
      ],
    }).compile();

    service = module.get(StoreService);
    userRepository = module.get(UserRepository);
    productRepository = module.get(ProductRepository);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deposit', () => {
    describe('when deposit is called with invalid user identifier', () => {
      test('then it should throw not found error', async () => {
        expect.assertions(1);
        try {
          await service.deposit({ value: 10 }, -1);
        } catch (ex) {
          expect(ex).toBeInstanceOf(NotFoundError);
        }
      });
    });

    describe('when deposit and user are valid', () => {
      const user = getBuyer();
      user.deposit = 75;

      test('then users balance should increase by deposit amount', async () => {
        const repositoryFindOne = jest
          .spyOn(userRepository, 'findOne')
          .mockResolvedValue(user);

        const repositorySave = jest
          .spyOn(userRepository, 'save')
          .mockResolvedValue(undefined);

        await service.deposit({ value: 5 }, user.id);

        expect(repositoryFindOne).toBeCalledWith(user.id);
        expect(repositorySave).toBeCalledWith({
          ...user,
          deposit: 80,
        });
      });
    });
  });

  describe('buy', () => {
    describe('when buy is called with invalid user identifier', () => {
      test('then it should throw not found error', async () => {
        expect.assertions(1);
        try {
          await service.buy({ productId: 1, amount: 1 }, -1);
        } catch (ex) {
          expect(ex).toBeInstanceOf(NotFoundError);
        }
      });
    });

    describe('when buy is called with invalid product identifier', () => {
      test('then it should throw not found error', async () => {
        expect.assertions(1);
        try {
          await service.buy({ productId: -1, amount: 1 }, 1);
        } catch (ex) {
          expect(ex).toBeInstanceOf(NotFoundError);
        }
      });
    });

    describe('when buy is called amount larger than product availability', () => {
      test('then it should throw validation error', async () => {
        const product = getProduct();
        product.amountAvailable = 9;

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);

        expect.assertions(1);
        try {
          await service.buy({ productId: product.id, amount: 10 }, 1);
        } catch (ex) {
          expect(ex).toBeInstanceOf(ValidationError);
        }
      });
    });

    describe('when buy is called with overall price > than users deposit', () => {
      test('then it should throw validation error', async () => {
        const product = getProduct();
        product.cost = 11;

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);

        jest.spyOn(userRepository, 'findOne').mockImplementation(() =>
          Promise.resolve({
            ...getBuyer(),
            id: 1,
            deposit: 10,
          } as UserEntity),
        );

        expect.assertions(1);

        try {
          await service.buy({ productId: product.id, amount: 1 }, 1);
        } catch (ex) {
          expect(ex).toBeInstanceOf(ValidationError);
        }
      });
    });

    describe('when buy is called with valid arguments', () => {
      test('then it should decrease product availability amount by requested amount', async () => {
        const product = getProduct();
        product.amountAvailable = 10;

        const buyer = getBuyer();
        buyer.deposit = 100;

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);

        const productSave = jest
          .spyOn(productRepository, 'save')
          .mockResolvedValue(product);

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(buyer);

        await service.buy({ productId: product.id, amount: 7 }, buyer.id);
        expect(productSave).toBeCalledWith({
          ...product,
          amountAvailable: 3,
        });
      });

      test('then it should set users balance to 0', async () => {
        const product = getProduct();

        const buyer = getBuyer();
        buyer.deposit = 100;

        jest.spyOn(userRepository, 'findOne').mockResolvedValue(buyer);

        const userSave = jest
          .spyOn(userRepository, 'save')
          .mockResolvedValue(buyer);

        await service.buy({ productId: product.id, amount: 1 }, buyer.id);
        expect(userSave).toBeCalledWith({ ...buyer, deposit: 0 });
      });

      test('then it should return total spent amount', async () => {
        const product = getProduct();
        product.cost = 5;
        product.amountAvailable = 1000;

        const buyer = getBuyer();
        buyer.deposit = 10000;

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(buyer);

        const result = await service.buy(
          { productId: product.id, amount: 1 },
          buyer.id,
        );
        expect(result.totalSpent).toBe(5);

        buyer.deposit = 1000;
        product.cost = 10;

        const result2 = await service.buy(
          { productId: product.id, amount: 3 },
          buyer.id,
        );
        expect(result2.totalSpent).toBe(30);

        buyer.deposit = 1000;
        product.cost = 45;

        const result3 = await service.buy(
          { productId: product.id, amount: 10 },
          buyer.id,
        );
        expect(result3.totalSpent).toBe(450);
      });

      test('then it should return purchased product', async () => {
        const product = getProduct();
        product.productName = 'Cola';

        const buyer = getBuyer();
        buyer.deposit = 1000;

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(buyer);

        const result = await service.buy(
          { productId: product.id, amount: 1 },
          buyer.id,
        );
        expect(result.product).toBe('Cola');

        buyer.deposit = 1000;
        product.productName = 'Test 1';

        const result2 = await service.buy(
          { productId: product.id, amount: 3 },
          buyer.id,
        );
        expect(result2.product).toBe('Test 1');
      });

      test('then it should return coin change using [5, 10, 20, 50, 100] coins', async () => {
        const product = getProduct();
        product.cost = 20;
        product.amountAvailable = 10000;

        const buyer = getBuyer();
        buyer.deposit = 100;

        jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(buyer);

        const result = await service.buy(
          { productId: product.id, amount: 1 },
          buyer.id,
        );
        expect(result.coinChange).toEqual([50, 20, 10]);

        buyer.deposit = 150;
        product.cost = 50;

        const result2 = await service.buy(
          { productId: product.id, amount: 3 },
          buyer.id,
        );
        expect(result2.coinChange).toEqual([]);

        buyer.deposit = 875;
        product.cost = 25;

        const result3 = await service.buy(
          { productId: product.id, amount: 25 },
          buyer.id,
        );
        expect(result3.coinChange).toEqual([100, 100, 50]);

        buyer.deposit = 50;
        product.cost = 5;

        const result4 = await service.buy(
          { productId: product.id, amount: 9 },
          buyer.id,
        );
        expect(result4.coinChange).toEqual([5]);

        buyer.deposit = 95;
        product.cost = 50;

        const result5 = await service.buy(
          { productId: product.id, amount: 1 },
          buyer.id,
        );
        expect(result5.coinChange).toEqual([20, 20, 5]);
      });
    });
  });
});
