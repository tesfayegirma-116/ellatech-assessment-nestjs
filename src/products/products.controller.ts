import {
    Controller,
    Post,
    Put,
    Get,
    Body,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { AdjustProductDto } from '../dto/adjust-product.dto';
import { Product } from '../entities/product.entity';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
        return await this.productsService.create(createProductDto);
    }

    @Put('adjust')
    @HttpCode(HttpStatus.OK)
    async adjust(@Body() adjustProductDto: AdjustProductDto): Promise<Product> {
        return await this.productsService.adjust(adjustProductDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<Product[]> {
        return await this.productsService.findAll();
    }
}

