import express, { Request, Response } from 'express';
import request from 'supertest';

import authentication from '../src/middleware/authentication';
import healthCheck from '../src/middleware/healthCheck';
import notFound from '../src/middleware/notFound';
import validator from '../src/middleware/validator';

jest.mock('../src/middleware/winston', () => ({
    error: jest.fn(),
    info: jest.fn(),
    stream: jest.fn(),
}));

describe('Middleware', () => {
    let app: express.Express;

    beforeEach(() => {
        app = express();
        app.use(express.json());
    });

    describe('validator', () => {
        it('should set creation_date and convert empty strings to null', async () => {
            app.post('/test', validator, (req: Request, res: Response) => {
                res.json(req.body);
            });
            const res = await request(app)
                .post('/test')
                .send({ name: '', creation_date: '2020-01-01' });
            expect(res.body.creation_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(res.body.name).toBeNull();
        });
    });

    describe('notFound', () => {
        it('should return 404 with error message', async () => {
            app.use(notFound);
            const res = await request(app).get('/nonexistent');
            expect(res.status).toBe(404);
            expect(res.body.error.message).toBe('Not Found');
        });
    });

    describe('healthCheck', () => {
        it('should return 200 and health message', async () => {
            app.use(healthCheck);
            const res = await request(app).get('/api/health');
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('All up and running !!');
        });
    });

    describe('authentication', () => {
        it('should return 401 if no token provided', async () => {
            app.get('/secure', authentication, (_, res) => {
                res.send('ok');
            });
            const res = await request(app).get('/secure');
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Unauthorized');
        });

        it('should return 401 if token is invalid', async () => {
            app.get('/secure', authentication, (_, res) => {
                res.send('ok');
            });
            const res = await request(app)
                .get('/secure')
                .set('Authorization', 'Bearer invalidtoken');
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Invalid token');
        });
    });
});
