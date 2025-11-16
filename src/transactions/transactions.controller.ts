import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from '../entities/transaction.entity';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(
        @Query('productId') productId?: string,
        @Query('userId') userId?: string,
    ): Promise<Transaction[]> {
        if (productId) {
            return await this.transactionsService.findByProduct(productId);
        }
        if (userId) {
            return await this.transactionsService.findByUser(userId);
        }
        return await this.transactionsService.findAll();
    }
}

