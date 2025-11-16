import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from '../entities/product.entity';

describe('ProductsController', () => {
    let controller: ProductsController;
    let service: ProductsService;

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

    const mockProductsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        adjust: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductsController],
            providers: [
                {
                    provide: ProductsService,
                    useValue: mockProductsService,
                },
            ],
        }).compile();

        controller = module.get<ProductsController>(ProductsController);
        service = module.get<ProductsService>(ProductsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a product', async () => {
            const createDto = {
                name: 'Test Product',
                description: 'Test Description',
                price: 99.99,
                quantity: 100,
            };

            mockProductsService.create.mockResolvedValue(mockProduct);

            const result = await controller.create(createDto);

            expect(service.create).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(mockProduct);
        });
    });

    describe('adjust', () => {
        it('should adjust product quantity', async () => {
            const adjustDto = {
                productId: mockProduct.id,
                quantity: 50,
                userId: 'user-123',
                notes: 'Restocking',
            };

            const updatedProduct = { ...mockProduct, quantity: 150 };
            mockProductsService.adjust.mockResolvedValue(updatedProduct);

            const result = await controller.adjust(adjustDto);

            expect(service.adjust).toHaveBeenCalledWith(adjustDto);
            expect(result).toEqual(updatedProduct);
        });
    });

    describe('findAll', () => {
        it('should return an array of products', async () => {
            const products = [mockProduct];
            mockProductsService.findAll.mockResolvedValue(products);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual(products);
        });

        it('should return empty array when no products exist', async () => {
            mockProductsService.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
        });
    });
});

