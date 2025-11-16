import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Transactions (e2e)', () => {
    let app: INestApplication;
    let testProductId: string;
    let testUserId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        const userResponse = await request(app.getHttpServer())
            .post('/users')
            .send({
                email: `transactionuser${Date.now()}@example.com`,
                name: 'Transaction Test User',
            });
        testUserId = userResponse.body.id;

        const productResponse = await request(app.getHttpServer())
            .post('/products')
            .send({
                name: 'Transaction Test Product',
                price: 50.0,
                quantity: 100,
            });
        testProductId = productResponse.body.id;

        await request(app.getHttpServer()).put('/products/adjust').send({
            productId: testProductId,
            quantity: 25,
            userId: testUserId,
            notes: 'Initial adjustment',
        });
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /transactions', () => {
        it('should return all transactions', async () => {
            const response = await request(app.getHttpServer())
                .get('/transactions')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('type');
            expect(response.body[0]).toHaveProperty('quantity');
            expect(response.body[0]).toHaveProperty('previousQuantity');
            expect(response.body[0]).toHaveProperty('newQuantity');
            expect(response.body[0]).toHaveProperty('userId');
            expect(response.body[0]).toHaveProperty('productId');
            expect(response.body[0]).toHaveProperty('createdAt');
        });

        it('should return transactions filtered by productId', async () => {
            const response = await request(app.getHttpServer())
                .get(`/transactions?productId=${testProductId}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            response.body.forEach((transaction) => {
                expect(transaction.productId).toBe(testProductId);
            });
        });

        it('should return transactions filtered by userId', async () => {
            const response = await request(app.getHttpServer())
                .get(`/transactions?userId=${testUserId}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            response.body.forEach((transaction) => {
                expect(transaction.userId).toBe(testUserId);
            });
        });

        it('should return empty array for non-existent product', async () => {
            const response = await request(app.getHttpServer())
                .get('/transactions?productId=00000000-0000-0000-0000-000000000000')
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('should return empty array for non-existent user', async () => {
            const response = await request(app.getHttpServer())
                .get('/transactions?userId=00000000-0000-0000-0000-000000000000')
                .expect(200);

            expect(response.body).toEqual([]);
        });
    });

    describe('Transaction creation through product adjustment', () => {
        it('should create transaction when adjusting product', async () => {
            const beforeTransactions = await request(app.getHttpServer())
                .get(`/transactions?productId=${testProductId}`)
                .expect(200);

            const initialCount = beforeTransactions.body.length;

            await request(app.getHttpServer()).put('/products/adjust').send({
                productId: testProductId,
                quantity: 10,
                userId: testUserId,
                notes: 'Test transaction creation',
            });

            const afterTransactions = await request(app.getHttpServer())
                .get(`/transactions?productId=${testProductId}`)
                .expect(200);

            expect(afterTransactions.body.length).toBe(initialCount + 1);

            const latestTransaction = afterTransactions.body[0];
            expect(latestTransaction.quantity).toBe(10);
            expect(latestTransaction.notes).toBe('Test transaction creation');
            expect(latestTransaction.type).toBe('adjustment');
        });

        it('should track quantity changes correctly in transactions', async () => {
            const newProduct = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Quantity Track Product',
                    price: 30.0,
                    quantity: 50,
                });

            const adjustment1 = await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    productId: newProduct.body.id,
                    quantity: 25,
                    userId: testUserId,
                    notes: 'First adjustment',
                });

            const transactions = await request(app.getHttpServer())
                .get(`/transactions?productId=${newProduct.body.id}`)
                .expect(200);

            const transaction = transactions.body[0];
            expect(transaction.previousQuantity).toBe(50);
            expect(transaction.newQuantity).toBe(75);
            expect(transaction.quantity).toBe(25);
            expect(adjustment1.body.quantity).toBe(75);
        });
    });
});

