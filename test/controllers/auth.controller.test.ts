import authController from '../../src/controllers/auth.controller';
import userModel from '../../src/models/userModel';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

jest.mock('../../src/models/userModel');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('authController', () => {
  const mockResponse = (): Partial<Response> => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockRequest = (body: any = {}, session: any = {}, headers: any = {}): Partial<Request> => ({
    body,
    session,
    headers,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // signup
  describe('signup', () => {
    it('should return 400 if any required field is missing', async () => {
      const req = mockRequest({ username: 'John' });
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
      const mockSave = jest.fn().mockResolvedValue({
        _id: 'user123',
        username: 'John',
        email: 'john@example.com',
      });

      const mockUserModel = userModel as unknown as jest.Mock;
      mockUserModel.mockImplementation(() => ({ save: mockSave }));

      await authController.signup(req as Request, res as Response);

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
      const mockUserModel = userModel as unknown as jest.Mock;
      mockUserModel.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('DB error')),
      }));

      await authController.signup(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'failed to save user' });
    });
  });

  // signin
  describe('signin', () => {
    it('should return 400 if email or password is missing', async () => {
      const req = mockRequest({ email: 'test@example.com' }); // no password
      const res = mockResponse();

      await authController.signin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'missing information' });
    });

    it('should return 400 if user is not found', async () => {
      const req = mockRequest({
        email: 'missing@example.com',
        password: '123456',
      });
      const res = mockResponse();

      (userModel.findOne as jest.Mock).mockResolvedValue(null);

      await authController.signin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 if password is incorrect', async () => {
      const req = mockRequest({
        email: 'user@example.com',
        password: 'wrongpass',
      });
      const res = mockResponse();

      (userModel.findOne as jest.Mock).mockResolvedValue({ password: 'hashed_pass' });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await authController.signin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email or password don't match" });
    });

    it('should return 200 and token on success', async () => {
      const req = mockRequest({
        email: 'user@example.com',
        password: 'correctpass',
      }, {});
      const res = mockResponse();

      (userModel.findOne as jest.Mock).mockResolvedValue({
        _id: 'user123',
        email: 'user@example.com',
        password: 'hashed_pass',
      });
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('fake_token');

      await authController.signin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: 'fake_token',
      });
    });
  });

  // getUser
  describe('getUser', () => {
    it('should return 500 if no session or user exists', async () => {
      const req = mockRequest({}, undefined); // session undefined
      const res = mockResponse();

      await authController.getUser(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'You are not authenticated' });
    });

    it('should return 200 with user data if session is valid', async () => {
      const req = mockRequest({}, {
        user: {
          _id: 'user123',
        },
      });
      const res = mockResponse();

      (userModel.findById as jest.Mock).mockReturnValue({
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

  // logout
  describe('logout', () => {
    it('should return 200 with logout message', async () => {
      const req = {
        session: {
          user: { _id: 'user123' },
        },
      } as unknown as Request;
      const res = mockResponse();

      await authController.logout(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Disconnected' });
    });
  });
});
