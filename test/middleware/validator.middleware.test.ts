import express from 'express';
import request from 'supertest';
import validator from '../../src/middleware/validator';
import { badRequest } from '../../src/constants/statusCodes';

const app = express();
app.use(express.json());
app.post('/test', validator, (req, res) => {
    res.status(200).json(req.body); // Just return the body for testing purposes
});

describe('Validator Middleware', () => {
    it('should add creation_date if not present and remove it if present', async () => {
        const response = await request(app)
            .post('/test')
            .send({ email: 'user@example.com' }); // no creation_date present

        const currentDate = new Date().toJSON().slice(0, 10); // expected format
        expect(response.body.creation_date).toBe(currentDate); // creation_date should be set
    });

    it('should replace empty string values with null', async () => {
        const response = await request(app).post('/test').send({
            email: 'user@example.com',
            username: '',
            password: 'password123',
        });

        expect(response.body.username).toBeNull(); // username should be replaced with null
        expect(response.body.password).toBe('password123'); // password should stay the same
    });

    it('should remove creation_date if it is present in the request body', async () => {
        const response = await request(app)
            .post('/test')
            .send({ email: 'user@example.com', creation_date: '2025-05-12' });

        const currentDate = new Date().toJSON().slice(0, 10); // expected format
        expect(response.body.creation_date).toBe(currentDate); // creation_date should be replaced with the current date
    });

    it('should return a bad request response if there is an error in the middleware', async () => {
        const response = await request(app)
            .post('/test')
            .send({ email: 'user@example.com', password: '' }); // This should trigger a bad request error

        expect(response.status).toBe(badRequest); // Should return a bad request error
        expect(response.body.error).toBe('Email and password are required');
    });
});
