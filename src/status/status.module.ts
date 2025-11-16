import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [ProductsModule],
    controllers: [StatusController],
})
export class StatusModule { }

