import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Integration Flow (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Complete inventory management workflow', () => {
        it('should handle complete user and product lifecycle', async () => {
            const uniqueEmail = `workflow${Date.now()}@example.com`;
            const userResponse = await request(app.getHttpServer())
                .post('/users')
                .send({
                    email: uniqueEmail,
                    name: 'Workflow User',
                    phone: '+1234567890',
                })
                .expect(201);

            const userId = userResponse.body.id;
            expect(userId).toBeDefined();

            const productResponse = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Workflow Product',
                    description: 'A product for testing workflow',
                    price: 150.0,
                    quantity: 200,
                })
                .expect(201);

            const productId = productResponse.body.id;
            expect(productId).toBeDefined();
            expect(productResponse.body.quantity).toBe(200);

            const statusResponse = await request(app.getHttpServer())
                .get(`/status/${productId}`)
                .expect(200);
            expect(statusResponse.body.quantity).toBe(200);

            const adjustment1 = await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    productId,
                    quantity: 50,
                    userId,
                    notes: 'Restocking inventory',
                })
                .expect(200);
            expect(adjustment1.body.quantity).toBe(250);

            const adjustment2 = await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    productId,
                    quantity: -100,
                    userId,
                    notes: 'Sale - Black Friday',
                })
                .expect(200);
            expect(adjustment2.body.quantity).toBe(150);

            const transactions = await request(app.getHttpServer())
                .get(`/transactions?productId=${productId}`)
                .expect(200);
            expect(transactions.body.length).toBe(2);
            expect(transactions.body[0].quantity).toBe(-100);
            expect(transactions.body[1].quantity).toBe(50);

            const userTransactions = await request(app.getHttpServer())
                .get(`/transactions?userId=${userId}`)
                .expect(200);
            expect(userTransactions.body.length).toBeGreaterThanOrEqual(2);

            const finalStatus = await request(app.getHttpServer())
                .get(`/status/${productId}`)
                .expect(200);
            expect(finalStatus.body.quantity).toBe(150);

            const allProducts = await request(app.getHttpServer())
                .get('/products')
                .expect(200);
            const ourProduct = allProducts.body.find((p) => p.id === productId);
            expect(ourProduct.quantity).toBe(150);
        });

        it('should prevent invalid adjustments in workflow', async () => {
            const userResponse = await request(app.getHttpServer())
                .post('/users')
                .send({
                    email: `invalid${Date.now()}@example.com`,
                    name: 'Invalid Test User',
                })
                .expect(201);

            const productResponse = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Low Stock Product',
                    price: 25.0,
                    quantity: 10,
                })
                .expect(201);

            const productId = productResponse.body.id;
            const userId = userResponse.body.id;

            await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    productId,
                    quantity: -50,
                    userId,
                    notes: 'This should fail',
                })
                .expect(400);

            const finalStatus = await request(app.getHttpServer())
                .get(`/status/${productId}`)
                .expect(200);
            expect(finalStatus.body.quantity).toBe(10);

            const transactions = await request(app.getHttpServer())
                .get(`/transactions?productId=${productId}`)
                .expect(200);
            expect(transactions.body.length).toBe(0);
        });

        it('should handle multiple users adjusting same product', async () => {
            const user1 = await request(app.getHttpServer())
                .post('/users')
                .send({
                    email: `multiuser1${Date.now()}@example.com`,
                    name: 'Multi User 1',
                })
                .expect(201);

            const user2 = await request(app.getHttpServer())
                .post('/users')
                .send({
                    email: `multiuser2${Date.now()}@example.com`,
                    name: 'Multi User 2',
                })
                .expect(201);

            const product = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Shared Product',
                    price: 100.0,
                    quantity: 100,
                })
                .expect(201);

            const productId = product.body.id;

            await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    productId,
                    quantity: 20,
                    userId: user1.body.id,
                    notes: 'User 1 adjustment',
                })
                .expect(200);

            await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    productId,
                    quantity: 30,
                    userId: user2.body.id,
                    notes: 'User 2 adjustment',
                })
                .expect(200);

            const finalProduct = await request(app.getHttpServer())
                .get(`/status/${productId}`)
                .expect(200);
            expect(finalProduct.body.quantity).toBe(150);

            const allTransactions = await request(app.getHttpServer())
                .get(`/transactions?productId=${productId}`)
                .expect(200);
            expect(allTransactions.body.length).toBe(2);

            const user1Transactions = await request(app.getHttpServer())
                .get(`/transactions?userId=${user1.body.id}`)
                .expect(200);
            expect(user1Transactions.body.some((t) => t.productId === productId)).toBe(true);

            const user2Transactions = await request(app.getHttpServer())
                .get(`/transactions?userId=${user2.body.id}`)
                .expect(200);
            expect(user2Transactions.body.some((t) => t.productId === productId)).toBe(true);
        });

        it('should track cumulative adjustments correctly', async () => {
            const user = await request(app.getHttpServer())
                .post('/users')
                .send({
                    email: `cumulative${Date.now()}@example.com`,
                    name: 'Cumulative User',
                })
                .expect(201);

            const product = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Cumulative Product',
                    price: 50.0,
                    quantity: 100,
                })
                .expect(201);

            const productId = product.body.id;
            const userId = user.body.id;
            let expectedQuantity = 100;

            const adjustments = [10, -5, 15, -20, 25, -10];

            for (const adjustment of adjustments) {
                expectedQuantity += adjustment;
                const response = await request(app.getHttpServer())
                    .put('/products/adjust')
                    .send({
                        productId,
                        quantity: adjustment,
                        userId,
                        notes: `Adjustment of ${adjustment}`,
                    })
                    .expect(200);
                expect(response.body.quantity).toBe(expectedQuantity);
            }

            const finalStatus = await request(app.getHttpServer())
                .get(`/status/${productId}`)
                .expect(200);
            expect(finalStatus.body.quantity).toBe(expectedQuantity);

            const transactions = await request(app.getHttpServer())
                .get(`/transactions?productId=${productId}`)
                .expect(200);
            expect(transactions.body.length).toBe(adjustments.length);
        });
    });
});

