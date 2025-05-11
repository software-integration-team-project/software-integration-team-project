import express, { Request, Response } from 'express';
import request from 'supertest';
import authentication from '../../src/middleware/authentication';

jest.mock('../../src/middleware/winston', () => ({
  error: jest.fn(),
  info: jest.fn(),
  stream: jest.fn(),
}));

describe('Authentication Middleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it('should return 401 if no token is provided', async () => {
    app.get('/secure', authentication, (_req: Request, res: Response) => {
      res.send('OK');
    });

    const res = await request(app).get('/secure');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('should return 401 if token is invalid', async () => {
    app.get('/secure', authentication, (_req: Request, res: Response) => {
      res.send('OK');
    });

    const res = await request(app)
      .get('/secure')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid token');
  });
});
