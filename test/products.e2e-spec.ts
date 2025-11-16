import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Products (e2e)', () => {
    let app: INestApplication;
    let createdProductId: string;
    let createdUserId: string;

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
                email: 'testuser@example.com',
                name: 'Test User',
            });
        createdUserId = userResponse.body.id;
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /products', () => {
        it('should create a new product', async () => {
            const response = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Test Product',
                    description: 'A test product',
                    price: 99.99,
                    quantity: 100,
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe('Test Product');
            expect(response.body.description).toBe('A test product');
            expect(response.body.price).toBe(99.99);
            expect(response.body.quantity).toBe(100);
            expect(response.body.status).toBe('active');
            expect(response.body).toHaveProperty('createdAt');
            expect(response.body).toHaveProperty('updatedAt');

            createdProductId = response.body.id;
        });

        it('should create a product with minimal required fields', async () => {
            const response = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Minimal Product',
                    price: 50.0,
                    quantity: 10,
                })
                .expect(201);

            expect(response.body.name).toBe('Minimal Product');
            expect(response.body.price).toBe(50.0);
            expect(response.body.quantity).toBe(10);
        });

        it('should fail validation when name is missing', async () => {
            await request(app.getHttpServer())
                .post('/products')
                .send({
                    price: 99.99,
                    quantity: 100,
                })
                .expect(400);
        });

        it('should fail validation when price is negative', async () => {
            await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Invalid Product',
                    price: -10,
                    quantity: 100,
                })
                .expect(400);
        });

        it('should fail validation when quantity is negative', async () => {
            await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Invalid Product',
                    price: 99.99,
                    quantity: -5,
                })
                .expect(400);
        });
    });

    describe('GET /products', () => {
        it('should return all products', async () => {
            const response = await request(app.getHttpServer())
                .get('/products')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).toHaveProperty('price');
            expect(response.body[0]).toHaveProperty('quantity');
        });
    });

    describe('PUT /products/adjust', () => {
        it('should adjust product quantity with positive value', async () => {
            const response = await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    productId: createdProductId,
                    quantity: 50,
                    userId: createdUserId,
                    notes: 'Restocking',
                })
                .expect(200);

            expect(response.body.id).toBe(createdProductId);
            expect(response.body.quantity).toBe(150);
        });

        it('should adjust product quantity with negative value', async () => {
            const response = await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    productId: createdProductId,
                    quantity: -30,
                    userId: createdUserId,
                    notes: 'Damaged items',
                })
                .expect(200);

            expect(response.body.quantity).toBe(120);
        });

        it('should fail when adjustment results in negative quantity', async () => {
            await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    productId: createdProductId,
                    quantity: -200,
                    userId: createdUserId,
                })
                .expect(400);
        });

        it('should fail validation when productId is missing', async () => {
            await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    quantity: 10,
                    userId: createdUserId,
                })
                .expect(400);
        });

        it('should fail validation when userId is missing', async () => {
            await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    productId: createdProductId,
                    quantity: 10,
                })
                .expect(400);
        });

        it('should fail when product does not exist', async () => {
            await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    productId: '00000000-0000-0000-0000-000000000000',
                    quantity: 10,
                    userId: createdUserId,
                })
                .expect(404);
        });

        it('should adjust to zero quantity', async () => {
            const tempResponse = await request(app.getHttpServer())
                .post('/products')
                .send({
                    name: 'Temp Product',
                    price: 10.0,
                    quantity: 50,
                });

            const response = await request(app.getHttpServer())
                .put('/products/adjust')
                .send({
                    productId: tempResponse.body.id,
                    quantity: -50,
                    userId: createdUserId,
                })
                .expect(200);

            expect(response.body.quantity).toBe(0);
        });
    });
});

