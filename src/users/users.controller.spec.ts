import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    const mockUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        createdAt: new Date(),
        updatedAt: new Date(),
        transactions: [],
    };

    const mockUsersService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a user', async () => {
            const createDto = {
                email: 'test@example.com',
                name: 'Test User',
                phone: '+1234567890',
            };

            mockUsersService.create.mockResolvedValue(mockUser);

            const result = await controller.create(createDto);

            expect(service.create).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(mockUser);
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const users = [mockUser];
            mockUsersService.findAll.mockResolvedValue(users);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual(users);
        });

        it('should return empty array when no users exist', async () => {
            mockUsersService.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
        });
    });
});

