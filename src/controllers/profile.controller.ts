import { Request, Response } from 'express';

import pool from '../boot/database/db_connect';
import { badRequest, queryError, success } from '../constants/statusCodes';
import logger from '../middleware/winston';

const editPassword = async (req: Request, res: Response): Promise<void> => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        res.status(badRequest).json({ message: 'Missing parameters' });
    } else {
        if (oldPassword === newPassword) {
            res.status(badRequest).json({
                message: 'New password cannot be equal to old password',
            });
        } else {
            pool.query(
                'SELECT * FROM users WHERE email = $1 AND password = crypt($2, password);',
                [req.session.user.email, oldPassword],
                (err, rows) => {
                    if (err) {
                        logger.error(err.stack);
                        res.status(queryError).json({
                            error: 'Exception occurred while updating password',
                        });
                    } else {
                        if (rows.rows[0]) {
                            pool.query(
                                "UPDATE users SET password = crypt($1, gen_salt('bf')) WHERE email = $2;",
                                [newPassword, req.session.user.email],
                                (err) => {
                                    if (err) {
                                        logger.error(err.stack);
                                        res.status(queryError).json({
                                            error: 'Exception occurred while updating password',
                                        });
                                    } else {
                                        res.status(success).json({
                                            message: 'Password updated',
                                        });
                                    }
                                },
                            );
                        } else {
                            res.status(badRequest).json({
                                message: 'Incorrect password',
                            });
                        }
                    }
                },
            );
        }
    }
};

const logout = async (req: Request, res: Response): Promise<void> => {
    if (req.session.user) {
        delete req.session.user;
    }

    res.status(200).json({ message: 'Disconnected' });
};

export default {
    editPassword,
    logout,
};
