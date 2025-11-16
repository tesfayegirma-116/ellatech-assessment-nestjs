import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class AdjustProductDto {
    @IsUUID()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsOptional()
    notes?: string;
}

