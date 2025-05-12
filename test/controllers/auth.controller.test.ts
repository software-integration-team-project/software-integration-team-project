import { Request, Response } from 'express';
import authController from '../../src/controllers/auth.controller';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ✅ Mock bcrypt and jwt
jest.mock('bcrypt', () => ({
  hashSync: jest.fn(),
  compareSync: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

// ✅ Inline userModel mock
jest.mock('../../src/models/userModel', () => {
  const mockSave = jest.fn();
  const mockFindOne = jest.fn();
  const mockFindById = jest.fn();

  const mockModel = Object.assign(
    jest.fn().mockImplementation(() => ({
      save: mockSave,
    })),
    {
      findOne: mockFindOne,
      findById: mockFindById,
      __mockSave: mockSave,
      __mockFindOne: mockFindOne,
      __mockFindById: mockFindById,
    }
  );

  return {
    __esModule: true,
    default: mockModel,
  };
});

const mockedUserModel = jest.requireMock('../../src/models/userModel').default;

describe('authController', () => {
  const mockSave = mockedUserModel.__mockSave;
  const mockFindOne = mockedUserModel.__mockFindOne;
  const mockFindById = mockedUserModel.__mockFindById;

  const mockResponse = (): Partial<Response> => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockRequest = (body: any = {}, session: any = {}): Partial<Request> => ({
    body,
    session,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should return 400 if fields are missing', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await authController.signup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'missing information' });
    });

    it('should return 200 and user data on success', async () => {
      const req = mockRequest({
        username: 'John',
        email: 'john@example.com',
        password: '123456',
      });
      const res = mockResponse();

      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashed_pass');
      mockSave.mockResolvedValue({
        _id: 'user123',
        username: 'John',
        email: 'john@example.com',
      });

      await authController.signup(req as Request, res as Response);

      expect(mockedUserModel).toHaveBeenCalledWith({
        username: 'John',
        email: 'john@example.com',
        password: 'hashed_pass',
      });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'user123',
        username: 'John',
        email: 'john@example.com',
      });
    });

    it('should return 500 on save failure', async () => {
      const req = mockRequest({
        username: 'John',
        email: 'john@example.com',
        password: '123456',
      });
      const res = mockResponse();

      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashed_pass');
      mockSave.mockRejectedValue(new Error('DB error'));

      await authController.signup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'failed to save user' });
    });
  });

  describe('signin', () => {
    it('should return 400 if user is not found', async () => {
      const req = mockRequest({ email: 'john@example.com', password: '123456' });
      const res = mockResponse();

      mockFindOne.mockResolvedValue(null);

      await authController.signin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 if password is incorrect', async () => {
      const req = mockRequest({ email: 'john@example.com', password: 'wrong' });
      const res = mockResponse();

      mockFindOne.mockResolvedValue({ password: 'hashed_pass' });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await authController.signin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email or password don't match" });
    });

    it('should return 200 and token on success', async () => {
      const req = mockRequest({ email: 'john@example.com', password: '123456' }, {});
      const res = mockResponse();

      const fakeUser = {
        _id: 'user123',
        email: 'john@example.com',
        password: 'hashed_pass',
        username: 'John',
      };

      mockFindOne.mockResolvedValue(fakeUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      await authController.signin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: 'mock_token' });
    });
  });

  describe('getUser', () => {
    it('should return 500 if not authenticated', async () => {
      const req = mockRequest({}, {});
      const res = mockResponse();

      await authController.getUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'You are not authenticated' });
    });

    it('should return 200 with user data if session is valid', async () => {
      const req = mockRequest({}, { user: { _id: 'user123' } });
      const res = mockResponse();

      mockFindById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: 'user123',
          username: 'John',
          email: 'john@example.com',
        }),
      });

      await authController.getUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'user123',
        username: 'John',
        email: 'john@example.com',
      });
    });
  });

  describe('logout', () => {
    it('should clear session and return 200', async () => {
      const req = mockRequest({}, { user: { _id: 'user123' } });
      const res = mockResponse();

      await authController.logout(req as Request, res as Response);

      expect(req.session.user).toBeUndefined();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Disconnected' });
    });
  });
});
