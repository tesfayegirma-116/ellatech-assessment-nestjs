import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
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

    describe('POST /users', () => {
        it('should create a new user with all fields', async () => {
            const uniqueEmail = `user${Date.now()}@example.com`;
            const response = await request(app.getHttpServer())
                .post('/users')
                .send({
                    email: uniqueEmail,
                    name: 'Test User',
                    phone: '+1234567890',
                })
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body.email).toBe(uniqueEmail);
            expect(response.body.name).toBe('Test User');
            expect(response.body.phone).toBe('+1234567890');
            expect(response.body).toHaveProperty('createdAt');
            expect(response.body).toHaveProperty('updatedAt');
        });

        it('should create a user without optional phone field', async () => {
            const uniqueEmail = `user${Date.now()}@example.com`;
            const response = await request(app.getHttpServer())
                .post('/users')
                .send({
                    email: uniqueEmail,
                    name: 'Test User No Phone',
                })
                .expect(201);

            expect(response.body.email).toBe(uniqueEmail);
            expect(response.body.name).toBe('Test User No Phone');
        });

        it('should fail when creating user with duplicate email', async () => {
            const uniqueEmail = `duplicate${Date.now()}@example.com`;

            await request(app.getHttpServer())
                .post('/users')
                .send({
                    email: uniqueEmail,
                    name: 'First User',
                })
                .expect(201);

            await request(app.getHttpServer())
                .post('/users')
                .send({
                    email: uniqueEmail,
                    name: 'Second User',
                })
                .expect(409);
        });

        it('should fail validation when email is missing', async () => {
            await request(app.getHttpServer())
                .post('/users')
                .send({
                    name: 'Test User',
                })
                .expect(400);
        });

        it('should fail validation when email is invalid', async () => {
            await request(app.getHttpServer())
                .post('/users')
                .send({
                    email: 'invalid-email',
                    name: 'Test User',
                })
                .expect(400);
        });

        it('should fail validation when name is missing', async () => {
            await request(app.getHttpServer())
                .post('/users')
                .send({
                    email: 'test@example.com',
                })
                .expect(400);
        });
    });

    describe('GET /users', () => {
        it('should return all users', async () => {
            const response = await request(app.getHttpServer())
                .get('/users')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('id');
            expect(response.body[0]).toHaveProperty('email');
            expect(response.body[0]).toHaveProperty('name');
        });
    });
});

