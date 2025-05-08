import { Request, Response } from 'express';

import pool from '../boot/database/db_connect';
import { badRequest, queryError, success } from '../constants/statusCodes';
import logger from '../middleware/winston';
import ratingModel from '../models/ratingModel';

const addRating = async (req: Request, res: Response): Promise<void> => {
    const { movieId } = req.params;
    const { rating } = req.body;

    const movie_id = parseInt(movieId);

    if (isNaN(movie_id) || !rating) {
        res.status(badRequest).json({ message: 'Missing parameters' });
    } else {
        try {
            const ratingObj = new ratingModel({
                email: req.session.user.email,
                movie_id,
                rating, // equivalent of rating: rating
            });

            await ratingObj.save();

            const ratings = await ratingModel.find({}, { rating });

            const averageRating = ratings.reduce(
                (acc, rating) => acc + rating.rating,
                0,
            );

            await pool.query(
                'UPDATE movies SET rating = $1 WHERE movie_id = $2;',
                [averageRating, movie_id],
            );
            res.status(success).json({ message: 'Rating added' });
        } catch (error) {
            logger.error(error.stack);
            res.status(queryError).json({
                error: 'Exception occurred while adding rating',
            });
        }
    }
};

export default {
    addRating,
};
