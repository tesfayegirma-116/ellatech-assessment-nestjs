import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return await this.usersService.create(createUserDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<User[]> {
        return await this.usersService.findAll();
    }
}

