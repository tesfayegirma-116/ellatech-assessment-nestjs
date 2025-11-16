import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { TransactionsModule } from './transactions/transactions.module';
import { StatusController } from './status/status.controller';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'ellatech_user',
      password: process.env.DB_PASSWORD || 'ellatech_password',
      database: process.env.DB_DATABASE || 'ellatech_db',
      entities: [User, Product, Transaction],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    UsersModule,
    ProductsModule,
    TransactionsModule,
  ],
  controllers: [AppController, StatusController],
  providers: [AppService],
})
export class AppModule { }
