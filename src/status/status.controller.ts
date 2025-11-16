import {
    Controller,
    Get,
    Param,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { Product } from '../entities/product.entity';

@Controller('status')
export class StatusController {
    constructor(private readonly productsService: ProductsService) { }

    @Get('health')
    @HttpCode(HttpStatus.OK)
    async healthCheck(): Promise<{ status: string; timestamp: string }> {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }

    @Get(':productId')
    @HttpCode(HttpStatus.OK)
    async getStatus(@Param('productId') productId: string): Promise<Product> {
        return await this.productsService.getStatus(productId);
    }
}

