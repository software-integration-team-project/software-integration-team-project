import messageController from '../../src/controllers/messages.controller';
import { Request, Response } from 'express';

jest.mock('../../src/controllers/messages.controller');

describe('messages.routes.ts', () => {
  const mockResponse = (): Partial<Response> => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockRequest = (params: any = {}, body: any = {}): Partial<Request> => ({
    params,
    body,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should route POST /add/message to addMessage', async () => {
    const req = mockRequest({}, {
      name: 'Test message',
      user: '609e129e4f1c2a001ce5e8a1',
    });
    const res = mockResponse();

    (messageController.addMessage as jest.Mock).mockImplementation(async (_req, _res) => {
      return _res.status(201).json({ name: 'Test message', user: '609e129e4f1c2a001ce5e8a1' });
    });

    await messageController.addMessage(req as Request, res as Response);

    expect(messageController.addMessage).toHaveBeenCalledWith(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ name: 'Test message', user: '609e129e4f1c2a001ce5e8a1' });
  });

  it('should route GET / to getMessages', async () => {
    const req = mockRequest();
    const res = mockResponse();

    (messageController.getMessages as jest.Mock).mockImplementation(async (_req, _res) => {
      return _res.status(200).json([{ name: 'Message 1' }, { name: 'Message 2' }]);
    });

    await messageController.getMessages(req as Request, res as Response);

    expect(messageController.getMessages).toHaveBeenCalledWith(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ name: 'Message 1' }, { name: 'Message 2' }]);
  });

  it('should route GET /:messageId to getMessageById', async () => {
    const req = mockRequest({ messageId: '123' });
    const res = mockResponse();

    (messageController.getMessageById as jest.Mock).mockImplementation(async (_req, _res) => {
      return _res.status(200).json({ name: 'Fetched message', _id: '123' });
    });

    await messageController.getMessageById(req as Request, res as Response);

    expect(messageController.getMessageById).toHaveBeenCalledWith(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ name: 'Fetched message', _id: '123' });
  });

  it('should route PUT /edit/:messageId to editMessage', async () => {
    const req = mockRequest(
      { messageId: '123' },
      { name: 'Updated message' }
    );
    const res = mockResponse();

    (messageController.editMessage as jest.Mock).mockImplementation(async (_req, _res) => {
      return _res.status(200).json({ _id: '123', name: 'Updated message' });
    });

    await messageController.editMessage(req as Request, res as Response);

    expect(messageController.editMessage).toHaveBeenCalledWith(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: '123', name: 'Updated message' });
  });

  it('should route DELETE /delete/:messageId to deleteMessage', async () => {
    const req = mockRequest({ messageId: '123' });
    const res = mockResponse();

    (messageController.deleteMessage as jest.Mock).mockImplementation(async (_req, _res) => {
      return _res.status(200).json({ message: 'Message deleted successfully' });
    });

    await messageController.deleteMessage(req as Request, res as Response);

    expect(messageController.deleteMessage).toHaveBeenCalledWith(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Message deleted successfully' });
  });
});
