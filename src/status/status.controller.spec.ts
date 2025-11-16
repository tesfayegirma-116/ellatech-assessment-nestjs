import { Test, TestingModule } from '@nestjs/testing';
import { StatusController } from './status.controller';
import { ProductsService } from '../products/products.service';
import { Product } from '../entities/product.entity';

describe('StatusController', () => {
    let controller: StatusController;
    let productsService: ProductsService;

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
        getStatus: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StatusController],
            providers: [
                {
                    provide: ProductsService,
                    useValue: mockProductsService,
                },
            ],
        }).compile();

        controller = module.get<StatusController>(StatusController);
        productsService = module.get<ProductsService>(ProductsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('healthCheck', () => {
        it('should return health status with timestamp', async () => {
            const result = await controller.healthCheck();

            expect(result).toHaveProperty('status', 'ok');
            expect(result).toHaveProperty('timestamp');
            expect(new Date(result.timestamp)).toBeInstanceOf(Date);
        });

        it('should return current timestamp', async () => {
            const beforeTime = new Date().getTime();
            const result = await controller.healthCheck();
            const afterTime = new Date().getTime();
            const resultTime = new Date(result.timestamp).getTime();

            expect(resultTime).toBeGreaterThanOrEqual(beforeTime);
            expect(resultTime).toBeLessThanOrEqual(afterTime);
        });
    });

    describe('getStatus', () => {
        it('should return product status by id', async () => {
            const productId = mockProduct.id;
            mockProductsService.getStatus.mockResolvedValue(mockProduct);

            const result = await controller.getStatus(productId);

            expect(productsService.getStatus).toHaveBeenCalledWith(productId);
            expect(result).toEqual(mockProduct);
        });

        it('should call productsService.getStatus with correct parameter', async () => {
            const productId = 'test-product-id';
            mockProductsService.getStatus.mockResolvedValue(mockProduct);

            await controller.getStatus(productId);

            expect(productsService.getStatus).toHaveBeenCalledTimes(1);
            expect(productsService.getStatus).toHaveBeenCalledWith(productId);
        });
    });
});

