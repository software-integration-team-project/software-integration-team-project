import { NextFunction, Request, Response } from 'express';

import { badRequest } from '../constants/statusCodes';
import logger from './winston';

const validator = (req: Request, res: Response, next: NextFunction): void => {
    // No creation date is allowed to pass through
    if (req.body.creation_date) {
        delete req.body.creation_date;
    }

    const creationDate = new Date().toJSON().slice(0, 10);
    req.body.creation_date = creationDate;

    try {
        for (const [key, value] of Object.entries(req.body)) {
            if (value === '') {
                req.body[key] = null;
                continue;
            }
        }

        next();
    } catch (error: unknown) {
        logger.error(error);
        res.status(badRequest).json({ error: 'Bad request' });
    }
};

export default validator;
