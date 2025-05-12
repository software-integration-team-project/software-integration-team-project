import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import userController from '../../src/controllers/users.controller';
import pool from '../../src/boot/database/db_connect';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Session, SessionData } from 'express-session';

jest.setTimeout(15000);

// Mock bcrypt
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));

// Mock DB
jest.mock('../../src/boot/database/db_connect', () => {
    const mockQuery = jest.fn();
    const mockConnect = jest.fn(() => ({
        query: mockQuery,
        release: jest.fn(),
    }));

    return {
        __esModule: true,
        default: {
            query: mockQuery,
            connect: mockConnect,
        },
    };
});

// Mock userModel
const mockUser = {
    _id: new mongoose.Types.ObjectId().toString(),
    email: 'test@example.com',
    username: 'testuser',
    password: '$2b$10$VxYYuJ0b/ZFXyIfZGqMIwOeStF.5jUoK8lFwMUVYOglvtsZ5l/E8S',
};

const mockLoginUser = {
    email: 'test@example.com',
    password: 'password123',
};

// --- User Controller: Login Tests ---
describe('userController.login', () => {
    let app: express.Express;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use((req: Request, _res: Response, next: NextFunction) => {
            req.session = {
                user: {
                    _id: '123',
                    username: 'mockuser',
                    email: 'test@example.com',
                },
            } as unknown as Session & Partial<SessionData>;
            next();
        });
        app.post('/login', userController.login);
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await new Promise((resolve) => setTimeout(resolve, 500));
    });

    it('should log in successfully and return a token', async () => {
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

        const res = await request(app).post('/login').send(mockLoginUser);

        expect(res.status).toBe(200);
        expect(res.body.token).toBe('test-jwt-token');
        expect(res.body.username).toBe('testuser');
    });

    it('should return 404 if user not found', async () => {
        (pool.query as jest.Mock).mockResolvedValue({ rows: [] });

        const res = await request(app).post('/login').send(mockLoginUser);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Incorrect email/password');
    });

    it('should return 404 if password is incorrect', async () => {
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        (pool.query as jest.Mock).mockResolvedValue({ rows: [mockUser] });

        const res = await request(app).post('/login').send(mockLoginUser);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Incorrect email/password');
    });

    it('should return 500 if query fails', async () => {
        (pool.query as jest.Mock).mockRejectedValue(new Error('Query failed'));

        const res = await request(app).post('/login').send(mockLoginUser);

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Exception occurred while logging in');
    });
});

// --- User Controller: Register Tests ---
describe('userController.register', () => {
    let app: express.Express;

    const mockRegisterUser = {
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'newpassword123',
        country: 'Testland',
        city: 'Testcity',
        street: 'Teststreet 123',
        creation_date: new Date(),
    };

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.post('/register', userController.register);
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await new Promise((resolve) => setTimeout(resolve, 500)); // Let async ops settle
    });

    it('should return 400 if missing parameters', async () => {
        const res = await request(app).post('/register').send({
            email: 'newuser@example.com',
            username: 'newuser',
            password: 'newpassword123',
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Missing parameters');
    });

    it('should register a user successfully', async () => {
        jest.setTimeout(50000); // Increase timeout to avoid time-related issues in long-running tests

        const mockRegisterUser = {
            email: 'test@example.com',
            username: 'testuser',
            password: 'password123',
            country: 'USA',
            city: 'New York',
            street: '5th Avenue',
            creation_date: new Date(),
        };

        // Mock the first query to check if the user exists
        (pool.query as jest.Mock)
            .mockResolvedValueOnce({ rowCount: 0 }) // User doesn't exist
            .mockResolvedValueOnce({ rowCount: 1 }) // User inserted
            .mockResolvedValueOnce({ rowCount: 1 }); // Address inserted

        // Make the request
        const res = await request(app).post('/register').send(mockRegisterUser);

        // Check the response and add more assertions to help with debugging
        expect(res.status).toBe(200); // Expected status 200
        expect(res.body.message).toBe('User created'); // Expected message
    });

    it('should return 409 if user already exists', async () => {
        (pool.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 });

        const res = await request(app).post('/register').send(mockRegisterUser);

        expect(res.status).toBe(409);
        expect(res.body.message).toBe('User already has an account');
    });

    it('should return 500 if query fails', async () => {
        (pool.query as jest.Mock).mockRejectedValue(new Error('Query failure'));

        const res = await request(app).post('/register').send(mockRegisterUser);

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Exception occurred while registering');
    });
});
