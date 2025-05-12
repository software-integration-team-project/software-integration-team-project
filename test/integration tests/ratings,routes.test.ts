import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { startApp } from '../../src/boot/setup';

dotenv.config({ path: '.env' });
jest.setTimeout(30000);
describe('Ratings Route Integration', () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI as string);
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    let token: string;

    beforeEach(async () => {
        await request(startApp).post('/users/register').send({
            username: 'testuser',
            email: 'test@example.com',
            password: 'Password123',
        });

        const loginRes = await request(startApp).post('/users/login').send({
            email: 'test@example.com',
            password: 'Password123',
        });

        token = loginRes.body.token;
    });

    it('should successfully create a rating', async () => {
        const res = await request(startApp)
            .post('/ratings')
            .set('Authorization', `Bearer ${token}`)
            .send({
                value: 5,
                comment: 'Excellent product!',
                productId: new mongoose.Types.ObjectId(),
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.value).toBe(5);
    });
});
