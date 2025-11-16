import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';

describe('TransactionsController', () => {
    let controller: TransactionsController;
    let service: TransactionsService;

    const mockTransaction: Transaction = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        type: TransactionType.ADJUSTMENT,
        quantity: 50,
        previousQuantity: 100,
        newQuantity: 150,
        notes: 'Restocking',
        createdAt: new Date(),
        userId: 'user-123',
        productId: 'product-123',
        user: {} as unknown as User,
        product: {} as unknown as Product,
    };

    const mockTransactionsService = {
        findAll: jest.fn(),
        findByProduct: jest.fn(),
        findByUser: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TransactionsController],
            providers: [
                {
                    provide: TransactionsService,
                    useValue: mockTransactionsService,
                },
            ],
        }).compile();

        controller = module.get<TransactionsController>(TransactionsController);
        service = module.get<TransactionsService>(TransactionsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all transactions when no query parameters', async () => {
            const transactions = [mockTransaction];
            mockTransactionsService.findAll.mockResolvedValue(transactions);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual(transactions);
        });

        it('should return transactions filtered by productId', async () => {
            const productId = 'product-123';
            const transactions = [mockTransaction];
            mockTransactionsService.findByProduct.mockResolvedValue(transactions);

            const result = await controller.findAll(productId);

            expect(service.findByProduct).toHaveBeenCalledWith(productId);
            expect(service.findAll).not.toHaveBeenCalled();
            expect(service.findByUser).not.toHaveBeenCalled();
            expect(result).toEqual(transactions);
        });

        it('should return transactions filtered by userId', async () => {
            const userId = 'user-123';
            const transactions = [mockTransaction];
            mockTransactionsService.findByUser.mockResolvedValue(transactions);

            const result = await controller.findAll(undefined, userId);

            expect(service.findByUser).toHaveBeenCalledWith(userId);
            expect(service.findAll).not.toHaveBeenCalled();
            expect(service.findByProduct).not.toHaveBeenCalled();
            expect(result).toEqual(transactions);
        });

        it('should prioritize productId over userId when both are provided', async () => {
            const productId = 'product-123';
            const userId = 'user-123';
            const transactions = [mockTransaction];
            mockTransactionsService.findByProduct.mockResolvedValue(transactions);

            const result = await controller.findAll(productId, userId);

            expect(service.findByProduct).toHaveBeenCalledWith(productId);
            expect(service.findByUser).not.toHaveBeenCalled();
            expect(result).toEqual(transactions);
        });

        it('should return empty array when no transactions found', async () => {
            mockTransactionsService.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
        });
    });
});

