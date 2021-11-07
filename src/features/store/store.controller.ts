import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StoreService } from './services';
import { BuyRequestDto, BuyResponseDto, DepositDto } from 'src/features/store/dtos';
import { Roles, User } from 'src/features/auth';
import { Role } from 'src/database';

@ApiTags('Store')
@Controller('')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deposit cent coins into vending machine account.' })
  @ApiResponse({ status: 201, description: 'Deposit has been successfully executed.' })
  @ApiResponse({ status: 403, description: 'User is not allowed to deposit.' })
  @ApiResponse({ status: 400, description: 'Invalid deposit data.' })
  @Post('deposit')
  @Roles(Role.Buyer)
  deposit(@User('userId') userId: number, @Body() deposit: DepositDto) {
    return this.storeService.deposit(deposit, userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buy products with money user has deposited.' })
  @ApiResponse({ status: 201, description: 'Products have been successfully purchased.', type: BuyResponseDto })
  @ApiResponse({ status: 403, description: 'User is not allowed to purchase products.' })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @Post('buy')
  @Roles(Role.Buyer)
  buy(@User('userId') userId: number, @Body() request: BuyRequestDto): Promise<BuyResponseDto> {
    return this.storeService.buy(request, userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reset users deposit back to 0.' })
  @ApiResponse({ status: 201, description: 'Deposit for user has been successfully reset to 0.' })
  @ApiResponse({ status: 403, description: 'User is not allowed to reset deposit.' })
  @ApiResponse({ status: 400, description: 'Invalid request data.' })
  @Put('reset')
  @Roles(Role.Buyer)
  reset(@User('userId') id: number): Promise<void> {
    return this.storeService.resetDeposit(id);
  }
}
