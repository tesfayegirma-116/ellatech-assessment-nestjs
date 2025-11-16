import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionType } from '../entities/transaction.entity';

describe('ProductsService', () => {
    let service: ProductsService;
    let repository: Repository<Product>;
    let transactionsService: TransactionsService;

    const mockProduct: Product = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        quantity: 100,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        transactions: [],
    };

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
    };

    const mockTransactionsService = {
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: getRepositoryToken(Product),
                    useValue: mockRepository,
                },
                {
                    provide: TransactionsService,
                    useValue: mockTransactionsService,
                },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        repository = module.get<Repository<Product>>(getRepositoryToken(Product));
        transactionsService = module.get<TransactionsService>(TransactionsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new product', async () => {
            const createDto = {
                name: 'Test Product',
                description: 'Test Description',
                price: 99.99,
                quantity: 100,
            };

            mockRepository.create.mockReturnValue(mockProduct);
            mockRepository.save.mockResolvedValue(mockProduct);

            const result = await service.create(createDto);

            expect(repository.create).toHaveBeenCalledWith(createDto);
            expect(repository.save).toHaveBeenCalledWith(mockProduct);
            expect(result).toEqual(mockProduct);
        });
    });

    describe('findAll', () => {
        it('should return an array of products', async () => {
            const products = [mockProduct];
            mockRepository.find.mockResolvedValue(products);

            const result = await service.findAll();

            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual(products);
        });

        it('should return an empty array when no products exist', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a product by id', async () => {
            mockRepository.findOne.mockResolvedValue(mockProduct);

            const result = await service.findOne(mockProduct.id);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: mockProduct.id },
            });
            expect(result).toEqual(mockProduct);
        });

        it('should throw NotFoundException when product does not exist', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('non-existent-id')).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.findOne('non-existent-id')).rejects.toThrow(
                'Product with ID non-existent-id not found',
            );
        });
    });

    describe('adjust', () => {
        it('should successfully adjust product quantity with positive adjustment', async () => {
            const adjustDto = {
                productId: mockProduct.id,
                quantity: 50,
                userId: 'user-123',
                notes: 'Restocking',
            };

            const updatedProduct = { ...mockProduct, quantity: 150 };
            mockRepository.findOne.mockResolvedValue(mockProduct);
            mockRepository.save.mockResolvedValue(updatedProduct);
            mockTransactionsService.create.mockResolvedValue({});

            const result = await service.adjust(adjustDto);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: adjustDto.productId },
            });
            expect(repository.save).toHaveBeenCalledWith(
                expect.objectContaining({ quantity: 150 }),
            );
            expect(transactionsService.create).toHaveBeenCalledWith({
                type: TransactionType.ADJUSTMENT,
                quantity: 50,
                previousQuantity: 100,
                newQuantity: 150,
                notes: 'Restocking',
                userId: 'user-123',
                productId: mockProduct.id,
            });
            expect(result.quantity).toBe(150);
        });

        it('should successfully adjust product quantity with negative adjustment', async () => {
            const productForNegativeAdjust = { ...mockProduct, quantity: 100 };
            const adjustDto = {
                productId: mockProduct.id,
                quantity: -30,
                userId: 'user-123',
                notes: 'Damaged items',
            };

            const updatedProduct = { ...mockProduct, quantity: 70 };
            mockRepository.findOne.mockResolvedValue(productForNegativeAdjust);
            mockRepository.save.mockResolvedValue(updatedProduct);
            mockTransactionsService.create.mockResolvedValue({});

            const result = await service.adjust(adjustDto);

            expect(result.quantity).toBe(70);
            expect(transactionsService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    quantity: -30,
                    previousQuantity: 100,
                    newQuantity: 70,
                }),
            );
        });

        it('should throw BadRequestException when adjustment results in negative quantity', async () => {
            const productWithStock = { ...mockProduct, quantity: 100 };
            const adjustDto = {
                productId: mockProduct.id,
                quantity: -150,
                userId: 'user-123',
            };

            mockRepository.findOne.mockResolvedValue(productWithStock);

            await expect(service.adjust(adjustDto)).rejects.toThrow(
                BadRequestException,
            );
            await expect(service.adjust(adjustDto)).rejects.toThrow(
                'Adjustment would result in negative quantity',
            );
            expect(repository.save).not.toHaveBeenCalled();
            expect(transactionsService.create).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when product does not exist', async () => {
            const adjustDto = {
                productId: 'non-existent-id',
                quantity: 10,
                userId: 'user-123',
            };

            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.adjust(adjustDto)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('should handle adjustment to zero quantity', async () => {
            const productWith100Stock = { ...mockProduct, quantity: 100 };
            const adjustDto = {
                productId: mockProduct.id,
                quantity: -100,
                userId: 'user-123',
                notes: 'Sold out',
            };

            const updatedProduct = { ...mockProduct, quantity: 0 };
            mockRepository.findOne.mockResolvedValue(productWith100Stock);
            mockRepository.save.mockResolvedValue(updatedProduct);
            mockTransactionsService.create.mockResolvedValue({});

            const result = await service.adjust(adjustDto);

            expect(result.quantity).toBe(0);
        });
    });

    describe('getStatus', () => {
        it('should return product status', async () => {
            mockRepository.findOne.mockResolvedValue(mockProduct);

            const result = await service.getStatus(mockProduct.id);

            expect(result).toEqual(mockProduct);
        });

        it('should throw NotFoundException when product does not exist', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.getStatus('non-existent-id')).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});

