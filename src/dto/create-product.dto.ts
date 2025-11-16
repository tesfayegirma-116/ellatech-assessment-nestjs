import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsOptional,
    Min,
} from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsNumber()
    @Min(0)
    quantity: number;

    @IsString()
    @IsOptional()
    status?: string;
}

