import { Injectable } from '@nestjs/common';
import {
  BuyRequestDto,
  BuyResponseDto,
  DepositDto,
  VALID_DEPOSIT_COINS,
} from 'src/features/store/dtos';
import { NotFoundError, ValidationError } from 'src/common';
import { ProductRepository, UserRepository } from 'src/database/repositories';

@Injectable()
export class StoreService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async deposit(deposit: DepositDto, userId: number): Promise<void> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundError('deposit/user-not-found', 'User not found');
    }

    user.deposit = user.deposit + deposit.value;
    await this.userRepository.save(user);
  }

  async buy(request: BuyRequestDto, userId: number): Promise<BuyResponseDto> {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundError('buy/user-not-found', 'User not found');
    }

    const product = await this.productRepository.findOne(request.productId);
    if (!product) {
      throw new NotFoundError(
        'buy/product-not-found',
        `Product with id='${request.productId}' not found`,
      );
    }

    if (product.amountAvailable < request.amount) {
      throw new ValidationError(
        'buy/product-out-of-stock',
        'Product is not currently available.',
      );
    }

    const price = product.cost * request.amount;
    if (user.deposit < price) {
      throw new ValidationError(
        'buy/insufficient-coins',
        'Not enough coins in deposit.',
      );
    }

    product.amountAvailable = product.amountAvailable - request.amount;
    await this.productRepository.save(product);

    const returnCoins = getChange(user.deposit - price, VALID_DEPOSIT_COINS);

    user.deposit = 0;
    await this.userRepository.save(user);

    return {
      coinChange: returnCoins,
      product: product.productName,
      totalSpent: price,
    };
  }

  async resetDeposit(userId: number) {
    await this.userRepository.update(userId, { deposit: 0 });
  }
}

function getChange(amount, coins) {
  coins = coins.sort((a, b) => b - a);

  const result = [];
  let num = amount;
  let str = '';

  for (let i = 0; i < coins.length; i++) {
    if (num >= coins[i]) {
      num = num - coins[i];
      str = str + coins[i] + ',';
      result.push(coins[i]);
      i--;
    }
  }

  return result;
}
