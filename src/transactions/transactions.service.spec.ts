import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionsService } from './transactions.service';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { User } from 'src/entities/user.entity';
import { Product } from 'src/entities/product.entity';

describe('TransactionsService', () => {
    let service: TransactionsService;
    let repository: Repository<Transaction>;

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

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionsService,
                {
                    provide: getRepositoryToken(Transaction),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<TransactionsService>(TransactionsService);
        repository = module.get<Repository<Transaction>>(
            getRepositoryToken(Transaction),
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new transaction', async () => {
            const createDto = {
                type: TransactionType.ADJUSTMENT,
                quantity: 50,
                previousQuantity: 100,
                newQuantity: 150,
                notes: 'Restocking',
                userId: 'user-123',
                productId: 'product-123',
            };

            mockRepository.create.mockReturnValue(mockTransaction);
            mockRepository.save.mockResolvedValue(mockTransaction);

            const result = await service.create(createDto);

            expect(repository.create).toHaveBeenCalledWith(createDto);
            expect(repository.save).toHaveBeenCalledWith(mockTransaction);
            expect(result).toEqual(mockTransaction);
        });

        it('should create transaction without optional notes', async () => {
            const createDto = {
                type: TransactionType.ADJUSTMENT,
                quantity: 50,
                previousQuantity: 100,
                newQuantity: 150,
                userId: 'user-123',
                productId: 'product-123',
            };

            const transactionWithoutNotes = { ...mockTransaction, notes: undefined };
            mockRepository.create.mockReturnValue(transactionWithoutNotes);
            mockRepository.save.mockResolvedValue(transactionWithoutNotes);

            const result = await service.create(createDto);

            expect(result.notes).toBeUndefined();
        });

        it('should create transaction with different types', async () => {
            const saleDto = {
                type: TransactionType.SALE,
                quantity: -10,
                previousQuantity: 100,
                newQuantity: 90,
                userId: 'user-123',
                productId: 'product-123',
            };

            const saleTransaction = { ...mockTransaction, type: TransactionType.SALE };
            mockRepository.create.mockReturnValue(saleTransaction);
            mockRepository.save.mockResolvedValue(saleTransaction);

            const result = await service.create(saleDto);

            expect(result.type).toBe(TransactionType.SALE);
        });
    });

    describe('findAll', () => {
        it('should return all transactions ordered by creation date descending', async () => {
            const transactions = [mockTransaction];
            mockRepository.find.mockResolvedValue(transactions);

            const result = await service.findAll();

            expect(repository.find).toHaveBeenCalledWith({
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual(transactions);
        });

        it('should return empty array when no transactions exist', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findByProduct', () => {
        it('should return transactions for a specific product', async () => {
            const productId = 'product-123';
            const transactions = [mockTransaction];
            mockRepository.find.mockResolvedValue(transactions);

            const result = await service.findByProduct(productId);

            expect(repository.find).toHaveBeenCalledWith({
                where: { productId },
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual(transactions);
        });

        it('should return empty array when no transactions for product', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await service.findByProduct('non-existent-product');

            expect(result).toEqual([]);
        });
    });

    describe('findByUser', () => {
        it('should return transactions for a specific user', async () => {
            const userId = 'user-123';
            const transactions = [mockTransaction];
            mockRepository.find.mockResolvedValue(transactions);

            const result = await service.findByUser(userId);

            expect(repository.find).toHaveBeenCalledWith({
                where: { userId },
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual(transactions);
        });

        it('should return empty array when no transactions for user', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await service.findByUser('non-existent-user');

            expect(result).toEqual([]);
        });
    });
});

