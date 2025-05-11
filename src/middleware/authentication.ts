import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { unauthorized } from '../constants/statusCodes';
import logger from './winston';

import type { UserType } from '../types/User';

// Add this type extension
declare module 'express-session' {
    interface SessionData {
        user: UserType;
    }
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization');

    if (!token) {
        res.status(unauthorized).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const decoded = jwt.verify(
            token.split(' ')[1],
            process.env.JWT_SECRET_KEY as string,
        ) as {
            user: UserType;
        };

        req.session.user = decoded.user;
        next();
    } catch (error) {
        logger.error(error);
        res.status(unauthorized).json({ error: 'Invalid token' });
    }
};

export default verifyToken;
