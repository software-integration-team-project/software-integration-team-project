import authController from '../../src/controllers/auth.controller';
import { Request, Response } from 'express';

jest.mock('../../src/controllers/auth.controller');

describe('auth.routes.ts', () => {
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

  it('should handle POST /signup', async () => {
    const req = mockRequest({
      username: 'assile',
      email: 'assile@test.com',
      password: 'securePass',
    });
    const res = mockResponse();

    (authController.signup as jest.Mock).mockImplementation(async (_req, _res) => {
      return _res.status(201).json({ message: 'User created' });
    });

    await authController.signup(req as Request, res as Response);

    expect(authController.signup).toHaveBeenCalledWith(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'User created' });
  });

  it('should handle POST /login', async () => {
    const req = mockRequest({
      email: 'assile@test.com',
      password: 'securePass',
    });
    const res = mockResponse();

    (authController.signin as jest.Mock).mockImplementation(async (_req, _res) => {
      return _res.status(200).json({ token: 'mock-token' });
    });

    await authController.signin(req as Request, res as Response);

    expect(authController.signin).toHaveBeenCalledWith(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: 'mock-token' });
  });

  it('should handle GET /me', async () => {
    const req = mockRequest({}, { user: { _id: 'user123' } });
    const res = mockResponse();

    (authController.getUser as jest.Mock).mockImplementation(async (_req, _res) => {
      return _res.status(200).json({ user: { username: 'assile' } });
    });

    await authController.getUser(req as Request, res as Response);

    expect(authController.getUser).toHaveBeenCalledWith(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: { username: 'assile' } });
  });

  it('should handle GET /logout', async () => {
    const req = mockRequest({}, { user: { _id: 'user123' } });
    const res = mockResponse();

    (authController.logout as jest.Mock).mockImplementation(async (_req, _res) => {
      return _res.status(200).json({ message: 'Disconnected' });
    });

    await authController.logout(req as Request, res as Response);

    expect(authController.logout).toHaveBeenCalledWith(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Disconnected' });
  });
});
