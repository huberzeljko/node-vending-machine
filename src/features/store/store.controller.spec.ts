import { StoreController } from './store.controller';
import { StoreService } from './services';
import { Test } from '@nestjs/testing';
import { BuyRequestDto, BuyResponseDto } from './dtos';

describe('StoreController', () => {
  let storeController: StoreController;
  let storeService: StoreService;

  const mockStoreService = () => ({
    deposit: jest.fn(),
    buy: jest.fn().mockResolvedValue({
      totalSpent: 20,
      product: 'Chips',
      coinChange: [10, 5],
    }),
    resetDeposit: jest.fn(),
  });

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [],
      controllers: [StoreController],
      providers: [
        {
          provide: StoreService,
          useFactory: mockStoreService,
        },
      ],
    }).compile();

    storeController = moduleFixture.get(StoreController);
    storeService = moduleFixture.get(StoreService);
  });

  it('should be defined', () => {
    expect(storeController).toBeDefined();
  });

  describe('POST /deposit', () => {
    describe('when deposit is called', () => {
      const userId = 1;
      const mockDeposit = { value: 2 };

      beforeEach(async () => {
        await storeController.deposit(userId, mockDeposit);
      });

      it('then it should call storeService', () => {
        expect(storeService.deposit).toBeCalledWith(mockDeposit, userId);
      });
    });
  });

  describe('POST /buy', () => {
    describe('when buy is called', () => {
      let response: BuyResponseDto;

      const userId = 1;
      const request: BuyRequestDto = {
        amount: 1,
        productId: 1,
      };

      beforeEach(async () => {
        response = await storeController.buy(userId, request);
      });

      it('then it should call storeService', () => {
        expect(storeService.buy).toBeCalledWith(request, userId);
      });

      it('then it should return correct total spent', () => {
        expect(response.totalSpent).toBe(20);
      });

      it('then it should return correct purchased product', () => {
        expect(response.product).toBe('Chips');
      });

      it('then it should return correct coin change', () => {
        expect(response.coinChange).toEqual([10, 5]);
      });
    });
  });
});
