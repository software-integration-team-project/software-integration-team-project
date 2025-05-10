import messageController from '../../src/controllers/messages.controller';
import messageModel from '../../src/models/messageModel';
import { Request, Response } from 'express';

jest.mock('../../src/models/messageModel');

describe('messageController', () => {
  const mockResponse = (): Partial<Response> => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockRequest = (body: any = {}, params: any = {}, session: any = {}, headers: any = {}): Partial<Request> => ({
    body,
    params,
    session,
    headers,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // getMessages
  describe('getMessages', () => {
    it('should return 200 and a list of messages', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockMessages = [
        { _id: '1', name: 'Hello', user: 'user123' },
        { _id: '2', name: 'World', user: 'user456' },
      ];
      (messageModel.find as jest.Mock).mockResolvedValue(mockMessages);

      await messageController.getMessages(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMessages);
    });

    it('should throw an error if there is an error fetching messages', async () => {
      const req = mockRequest();
      const res = mockResponse();
    
      (messageModel.find as jest.Mock).mockRejectedValue(new Error('DB error'));
    
      await expect(
        messageController.getMessages(req as Request, res as Response)
      ).rejects.toThrow('DB error');
    });    
  });

  // getMessageById
  describe('getMessageById', () => {
    it('should return 200 and a message if found', async () => {
      const req = mockRequest({}, { messageId: '1' });
      const res = mockResponse();

      const mockMessage = { _id: '1', name: 'Hello', user: 'user123' };
      (messageModel.findById as jest.Mock).mockResolvedValue(mockMessage);

      await messageController.getMessageById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMessage);
    });

    it('should return 500 if message is not found', async () => {
      const req = mockRequest({}, { messageId: 'nonexistent' });
      const res = mockResponse();

      (messageModel.findById as jest.Mock).mockRejectedValue(new Error('Message not found'));

      await messageController.getMessageById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error while getting message' });
    });
  });

  // addMessage
  describe('addMessage', () => {
    it('should return 400 if message or name is missing', async () => {
      const req = mockRequest({ message: { name: '' } });
      const res = mockResponse();

      await messageController.addMessage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'missing information' });
    });

    it('should return 500 if user is not authenticated', async () => {
      const req = mockRequest({ message: { name: 'Test' } }, {}, {});
      const res = mockResponse();

      await messageController.addMessage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'You are not authenticated' });
    });

    it('should return 200 and the saved message on success', async () => {
      const req = mockRequest(
        { message: { name: 'Test', content: 'Hello' } },
        {},
        { user: { _id: 'user123' } },
      );
      const res = mockResponse();
    
      const mockSavedMessage = {
        _id: '1',
        name: 'Test',
        content: 'Hello',
        user: 'user123',
        save: jest.fn().mockResolvedValue(undefined), // resolves to nothing, but we don't use it
      };
    
      // message.user is assigned inside controller
      const messageModelMock = messageModel as unknown as jest.Mock;
      messageModelMock.mockImplementation((msg) => {
        return {
          ...msg,
          _id: '1',
          save: mockSavedMessage.save,
        };
      });
    
      await messageController.addMessage(req as Request, res as Response);
    
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        _id: '1',
        name: 'Test',
        content: 'Hello',
        user: 'user123',
        save: expect.any(Function), // matches what's returned in controller
      });
    });
    
    
    it('should return 500 if message saving fails', async () => {
      const req = mockRequest(
        { message: { name: 'Test', content: 'Hello' } },
        {},
        { user: { _id: 'user123' } },
      );
      const res = mockResponse();

      const mockMessageModel = messageModel as unknown as jest.Mock;
      mockMessageModel.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('DB error')),
      }));

      await messageController.addMessage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to add message' });
    });
  });

  // editMessage
  describe('editMessage', () => {
    it('should return 400 if messageId or name is missing', async () => {
      const req = mockRequest({ name: 'Updated' }, { messageId: '' });
      const res = mockResponse();

      await messageController.editMessage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'missing information' });
    });

    it('should return 200 and the updated message on success', async () => {
      const req = mockRequest({ name: 'Updated' }, { messageId: '1' });
      const res = mockResponse();

      const mockUpdatedMessage = { _id: '1', name: 'Updated', user: 'user123' };
      (messageModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedMessage);

      await messageController.editMessage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedMessage);
    });

    it('should return 500 if update fails', async () => {
      const req = mockRequest({ name: 'Updated' }, { messageId: '1' });
      const res = mockResponse();

      (messageModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await messageController.editMessage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update message' });
    });
  });

  // deleteMessage
  describe('deleteMessage', () => {
    it('should return 400 if messageId is missing', async () => {
      const req = mockRequest({}, { messageId: '' });
      const res = mockResponse();

      await messageController.deleteMessage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'missing information' });
    });

    it('should return 200 if message is successfully deleted', async () => {
      const req = mockRequest({}, { messageId: '1' });
      const res = mockResponse();

      (messageModel.findByIdAndDelete as jest.Mock).mockResolvedValue(true);

      await messageController.deleteMessage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Message deleted' });
    });

    it('should return 500 if deletion fails', async () => {
      const req = mockRequest({}, { messageId: '1' });
      const res = mockResponse();

      (messageModel.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await messageController.deleteMessage(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete message' });
    });
  });
});
