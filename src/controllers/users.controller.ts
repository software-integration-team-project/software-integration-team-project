import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import pool from '../boot/database/db_connect';
import {
    badRequest,
    notFound,
    queryError,
    success,
    userAlreadyExists,
} from '../constants/statusCodes';
import logger from '../middleware/winston';

const register = async (req: Request, res: Response): Promise<void> => {
    const { email, username, password } = req.body;
    const { country, city, street } = req.body;

    if (!email || !username || !password || !country) {
        res.status(badRequest).json({ message: 'Missing parameters' });
    } else {
        const client = await pool.connect();

        try {
            const result = await client.query(
                'SELECT * FROM users WHERE email = $1;',
                [email],
            );
            if (result.rowCount) {
                res.status(userAlreadyExists).json({
                    message: 'User already has an account',
                });
            } else {
                await client.query('BEGIN');
                const addedUser = await client.query(
                    `INSERT INTO users(email, username, password, creation_date)
           VALUES ($1, $2, crypt($3, gen_salt('bf')), $4);`,
                    [email, username, password, req.body.creation_date],
                );

                logger.info('USER ADDED', addedUser.rowCount);

                const address = await client.query(
                    `INSERT INTO addresses(email, country, street, city) VALUES ($1, $2, $3, $4);`,
                    [email, country, street, city],
                );
                logger.info('ADDRESS ADDED', address.rowCount);

                res.status(success).json({ message: 'User created' });
                await client.query('COMMIT');
            }
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error(error.stack);
            res.status(queryError).json({
                message: 'Exception occurred while registering',
            });
        } finally {
            client.release();
        }
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(badRequest).json({ message: 'Missing parameters' });
    } else {
        pool.query(
            'SELECT * FROM users WHERE email = $1 AND password = crypt($2, password);',
            [email, password],
            (err, rows) => {
                if (err) {
                    logger.error(err.stack);
                    res.status(queryError).json({
                        error: 'Exception occurred while logging in',
                    });
                } else {
                    if (rows.rows[0]) {
                        req.session.user = {
                            _id: rows.rows[0]._id,
                            email: rows.rows[0].email,
                            username: rows.rows[0].username,
                        };

                        const token = jwt.sign(
                            { user: { email: rows.rows[0].email } },
                            process.env.JWT_SECRET_KEY,
                            {
                                expiresIn: '1h',
                            },
                        );
                        res.status(success).json({
                            token,
                            username: rows.rows[0].username,
                        });
                    } else {
                        res.status(notFound).json({
                            message: 'Incorrect email/password',
                        });
                    }
                }
            },
        );
    }
};

export default {
    register,
    login,
};
