import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';

export enum TransactionType {
    ADJUSTMENT = 'adjustment',
    SALE = 'sale',
    RESTOCK = 'restock',
}

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: TransactionType,
        default: TransactionType.ADJUSTMENT,
    })
    type: TransactionType;

    @Column('int')
    quantity: number;

    @Column('int')
    previousQuantity: number;

    @Column('int')
    newQuantity: number;

    @Column('text', { nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.transactions, { eager: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: string;

    @ManyToOne(() => Product, (product) => product.transactions, { eager: true })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column()
    productId: string;
}

