/* eslint-disable */
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import ratingController from '../src/controllers/rating.controller';
import ratingModel from '../src/models/ratingModel';
import pool from '../src/boot/database/db_connect';
import mongoose from 'mongoose';
import { Session, SessionData } from 'express-session';

jest.mock('../src/boot/database/db_connect', () => {
    return {
        __esModule: true,
        default: {
            query: jest.fn(),
            connect: jest.fn(),
            on: jest.fn(),
        },
    };
});

jest.mock('../src/middleware/winston', () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        stream: jest.fn(),
    },
}));

jest.mock('../src/models/ratingModel');
jest.mock('../src/boot/database/db_connect', () => ({
    query: jest.fn(),
}));

const mockSave = jest.fn();
const mockFind = jest.fn();

(ratingModel as any).mockImplementation(() => ({
    save: mockSave,
}));
(ratingModel.find as any) = mockFind;

describe('ratingController.addRating', () => {
    let app: express.Express;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use((req: Request, _res: Response, next: NextFunction) => {
            req.session = {
                user: {
                    _id: new mongoose.Types.ObjectId().toString(),
                    username: 'mockuser',
                    email: 'test@example.com',
                },
            } as unknown as Session & Partial<SessionData>;
            next();
        });
        app.post('/rating/:movieId', ratingController.addRating);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should add a rating and update movie rating in DB', async () => {
        mockSave.mockResolvedValue({});
        mockFind.mockResolvedValue([
            { rating: 4 },
            { rating: 5 },
            { rating: 3 },
        ]);
        (pool.query as jest.Mock).mockResolvedValue({});

        const res = await request(app).post('/rating/1').send({ rating: 5 });

        expect(mockSave).toHaveBeenCalled();
        expect(mockFind).toHaveBeenCalled();
        const mockQuery = pool.query as jest.Mock;
        mockQuery.mockResolvedValueOnce({
            rows: [{ rating: 4 }, { rating: 5 }, { rating: 3 }],
        });
        pool.query = mockQuery;

        expect(mockQuery).toHaveBeenCalledWith(
            'UPDATE movies SET rating = $1 WHERE movie_id = $2;',
            [12, 1],
        );

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Rating added');
    });

    it('should return 400 if missing parameters', async () => {
        const res = await request(app).post('/rating/abc').send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Missing parameters');
    });

    it('should return 500 if save fails', async () => {
        mockSave.mockRejectedValue(new Error('Save failed'));

        const res = await request(app).post('/rating/1').send({ rating: 4 });

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Exception occurred while adding rating');
    });
});
("Here's the current controller.test.ts. Don't add comments btw");
