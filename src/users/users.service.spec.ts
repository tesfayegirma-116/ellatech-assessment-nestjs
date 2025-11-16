import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
    let service: UsersService;
    let repository: Repository<User>;

    const mockUser: User = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
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

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        repository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const createDto = {
                email: 'test@example.com',
                name: 'Test User',
                phone: '+1234567890',
            };

            mockRepository.findOne.mockResolvedValue(null);
            mockRepository.create.mockReturnValue(mockUser);
            mockRepository.save.mockResolvedValue(mockUser);

            const result = await service.create(createDto);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { email: createDto.email },
            });
            expect(repository.create).toHaveBeenCalledWith(createDto);
            expect(repository.save).toHaveBeenCalledWith(mockUser);
            expect(result).toEqual(mockUser);
        });

        it('should throw ConflictException when email already exists', async () => {
            const createDto = {
                email: 'existing@example.com',
                name: 'Test User',
            };

            mockRepository.findOne.mockResolvedValue(mockUser);

            await expect(service.create(createDto)).rejects.toThrow(
                ConflictException,
            );
            await expect(service.create(createDto)).rejects.toThrow(
                'User with this email already exists',
            );
            expect(repository.create).not.toHaveBeenCalled();
            expect(repository.save).not.toHaveBeenCalled();
        });

        it('should create user without optional phone field', async () => {
            const createDto = {
                email: 'test@example.com',
                name: 'Test User',
            };

            const userWithoutPhone = { ...mockUser, phone: undefined };
            mockRepository.findOne.mockResolvedValue(null);
            mockRepository.create.mockReturnValue(userWithoutPhone);
            mockRepository.save.mockResolvedValue(userWithoutPhone);

            const result = await service.create(createDto);

            expect(result.phone).toBeUndefined();
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const users = [mockUser];
            mockRepository.find.mockResolvedValue(users);

            const result = await service.findAll();

            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual(users);
        });

        it('should return an empty array when no users exist', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('findOne', () => {
        it('should return a user by id', async () => {
            mockRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findOne(mockUser.id);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: mockUser.id },
            });
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('non-existent-id')).rejects.toThrow(
                NotFoundException,
            );
            await expect(service.findOne('non-existent-id')).rejects.toThrow(
                'User with ID non-existent-id not found',
            );
        });
    });
});

