import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Status (e2e)', () => {
    let app: INestApplication;
    let testProductId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();

        const productResponse = await request(app.getHttpServer())
            .post('/products')
            .send({
                name: 'Status Test Product',
                price: 75.0,
                quantity: 50,
            });
        testProductId = productResponse.body.id;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /status/health', () => {
        it('should return health status', async () => {
            const response = await request(app.getHttpServer())
                .get('/status/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'ok');
            expect(response.body).toHaveProperty('timestamp');
            expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
        });

        it('should return current timestamp', async () => {
            const beforeTime = new Date().getTime();
            const response = await request(app.getHttpServer())
                .get('/status/health')
                .expect(200);
            const afterTime = new Date().getTime();
            const resultTime = new Date(response.body.timestamp).getTime();

            expect(resultTime).toBeGreaterThanOrEqual(beforeTime);
            expect(resultTime).toBeLessThanOrEqual(afterTime);
        });
    });

    describe('GET /status/:productId', () => {
        it('should return product status by id', async () => {
            const response = await request(app.getHttpServer())
                .get(`/status/${testProductId}`)
                .expect(200);

            expect(response.body.id).toBe(testProductId);
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('quantity');
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('price');
        });

        it('should return 404 for non-existent product', async () => {
            await request(app.getHttpServer())
                .get('/status/00000000-0000-0000-0000-000000000000')
                .expect(404);
        });

        it('should reflect updated quantity in status', async () => {
            const userResponse = await request(app.getHttpServer())
                .post('/users')
                .send({
                    email: `statustest${Date.now()}@example.com`,
                    name: 'Status Test User',
                });

            const statusBefore = await request(app.getHttpServer())
                .get(`/status/${testProductId}`)
                .expect(200);

            const initialQuantity = statusBefore.body.quantity;

            await request(app.getHttpServer()).put('/products/adjust').send({
                productId: testProductId,
                quantity: 20,
                userId: userResponse.body.id,
            });

            const statusAfter = await request(app.getHttpServer())
                .get(`/status/${testProductId}`)
                .expect(200);

            expect(statusAfter.body.quantity).toBe(initialQuantity + 20);
        });
    });
});

