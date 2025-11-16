import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: 'EllaTech Assessment - NestJS Product Management API',
      version: '1.0.0',
      author: 'Tesfaye Girma (tesfayegirma360@gmail.com) - Senior Software Engineer',
      description: 'Build a small NestJS service with PostgreSQL and TypeORM that manages users and products, and records a transaction history.',
      endpoints: {
        health: '/status/health',
        users: '/users',
        products: '/products',
        transactions: '/transactions',
      },
      documentation: 'See API_EXAMPLES.md for detailed usage examples',
    };
  }
}
