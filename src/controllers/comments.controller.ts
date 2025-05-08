import { Request, Response } from 'express';

import { badRequest, queryError, success } from '../constants/statusCodes';
import logger from '../middleware/winston';
import commentModel from '../models/commentModel';

const addComment = async (req: Request, res: Response): Promise<void> => {
    const { movie_id } = req.params;
    const { rating, username, comment, title } = req.body;

    const movieId = parseInt(movie_id);

    if (
        !movie_id ||
        isNaN(movieId) ||
        !rating ||
        !username ||
        !comment ||
        !title
    ) {
        res.status(badRequest).json({ message: 'Missing parameters' });
    } else {
        try {
            const commentObj = new commentModel({
                movie_id: movieId,
                rating,
                username,
                comment,
                title,
            });

            await commentObj.save();

            res.status(success).json({ message: 'Comment added' });
        } catch (error) {
            logger.error(error.stack);
            res.status(queryError).json({
                error: 'Exception occurred while adding comment',
            });
        }
    }
};

const getCommentsById = async (req: Request, res: Response): Promise<void> => {
    const { movie_id } = req.params;

    const movieId = parseInt(movie_id);

    if (!movie_id || isNaN(movieId)) {
        res.status(badRequest).json({ message: 'movie id missing' });
    } else {
        try {
            const comments = await commentModel.find({ movie_id: movieId });
            res.status(success).json({ comments });
        } catch (error) {
            logger.error(error.stack);
            res.status(queryError).json({
                error: 'Exception occured while fetching comments',
            });
        }
    }
};

export default {
    getCommentsById,
    addComment,
};
