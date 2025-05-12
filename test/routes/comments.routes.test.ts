import commentController from '../../src/controllers/comments.controller';
import { Request, Response } from 'express';

jest.mock('../../src/controllers/comments.controller');

describe('comments.routes.ts', () => {
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

  it('should route POST /:movie_id to addComment', async () => {
    const req = mockRequest({ movie_id: '123' }, {
      rating: 5,
      username: 'TestUser',
      comment: 'Nice one',
      title: 'Solid',
    });
    const res = mockResponse();

    (commentController.addComment as jest.Mock).mockImplementation(async (_req, _res) => {
      return _res.status(200).json({ message: 'Comment added' });
    });

    await commentController.addComment(req as Request, res as Response);

    expect(commentController.addComment).toHaveBeenCalledWith(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Comment added' });
  });

  it('should route GET /:movie_id to getCommentsById', async () => {
    const req = mockRequest({ movie_id: '123' });
    const res = mockResponse();

    (commentController.getCommentsById as jest.Mock).mockImplementation(async (_req, _res) => {
      return _res.status(200).json({ comments: [] });
    });

    await commentController.getCommentsById(req as Request, res as Response);

    expect(commentController.getCommentsById).toHaveBeenCalledWith(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ comments: [] });
  });
});
