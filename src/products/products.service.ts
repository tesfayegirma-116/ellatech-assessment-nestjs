import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { AdjustProductDto } from '../dto/adjust-product.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../entities/transaction.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
        private transactionsService: TransactionsService,
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        const product = this.productsRepository.create(createProductDto);
        return await this.productsRepository.save(product);
    }

    async findAll(): Promise<Product[]> {
        return await this.productsRepository.find();
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.productsRepository.findOne({ where: { id } });
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }

    async adjust(adjustProductDto: AdjustProductDto): Promise<Product> {
        const { productId, quantity, userId, notes } = adjustProductDto;

        const product = await this.findOne(productId);
        const previousQuantity = product.quantity;
        const newQuantity = previousQuantity + quantity;

        if (newQuantity < 0) {
            throw new BadRequestException(
                'Adjustment would result in negative quantity',
            );
        }

        product.quantity = newQuantity;
        const updatedProduct = await this.productsRepository.save(product);

        await this.transactionsService.create({
            type: TransactionType.ADJUSTMENT,
            quantity,
            previousQuantity,
            newQuantity,
            notes,
            userId,
            productId,
        });

        return updatedProduct;
    }

    async getStatus(productId: string): Promise<Product> {
        return await this.findOne(productId);
    }
}

