import commentsController from '../../src/controllers/comments.controller';
import commentModel from '../../src/models/commentModel';
import { Request, Response } from 'express';

jest.mock('../../src/models/commentModel');

describe('commentsController', () => {
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

  describe('addComment', () => {
    it('should return 400 if any required field is missing', async () => {
      const req = mockRequest({ movie_id: '1' }, { rating: 5 }); // missing fields
      const res = mockResponse();

      await commentsController.addComment(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
    });

    it('should return 200 if comment is successfully saved', async () => {
      const req = mockRequest(
        { movie_id: '1' },
        {
          rating: 5,
          username: 'testuser',
          comment: 'great movie',
          title: 'Awesome',
        }
      );
      const res = mockResponse();

      const mockSave = jest.fn().mockResolvedValue({});
      (commentModel as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
      }));

      await commentsController.addComment(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Comment added' });
    });

    it('should return 500 if save throws an error', async () => {
      const req = mockRequest(
        { movie_id: '1' },
        {
          rating: 5,
          username: 'testuser',
          comment: 'great movie',
          title: 'Awesome',
        }
      );
      const res = mockResponse();

      (commentModel as unknown as jest.Mock).mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('DB error')),
      }));

      await commentsController.addComment(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Exception occurred while adding comment',
      });
    });
  });

  describe('getCommentsById', () => {
    it('should return 400 if movie_id is missing or invalid', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await commentsController.getCommentsById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'movie id missing' });
    });

    it('should return 200 with comments if found', async () => {
      const req = mockRequest({ movie_id: '1' });
      const res = mockResponse();

      (commentModel.find as jest.Mock).mockResolvedValue([
        { comment: 'Nice' },
        { comment: 'Great' },
      ]);

      await commentsController.getCommentsById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        comments: [{ comment: 'Nice' }, { comment: 'Great' }],
      });
    });

    it('should return 500 if DB throws an error', async () => {
      const req = mockRequest({ movie_id: '1' });
      const res = mockResponse();

      (commentModel.find as jest.Mock).mockRejectedValue(new Error('DB error'));

      await commentsController.getCommentsById(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Exception occured while fetching comments',
      });
    });
  });
});
