import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from '../entities/transaction.entity';

interface CreateTransactionDto {
    type: TransactionType;
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    notes?: string;
    userId: string;
    productId: string;
}

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionsRepository: Repository<Transaction>,
    ) { }

    async create(
        createTransactionDto: CreateTransactionDto,
    ): Promise<Transaction> {
        const transaction = this.transactionsRepository.create(
            createTransactionDto,
        );
        return await this.transactionsRepository.save(transaction);
    }

    async findAll(): Promise<Transaction[]> {
        return await this.transactionsRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findByProduct(productId: string): Promise<Transaction[]> {
        return await this.transactionsRepository.find({
            where: { productId },
            order: { createdAt: 'DESC' },
        });
    }

    async findByUser(userId: string): Promise<Transaction[]> {
        return await this.transactionsRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
}

