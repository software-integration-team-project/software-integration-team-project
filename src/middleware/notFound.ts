import { Request, Response } from 'express';

export default (_: Request, res: Response): void => {
    const err = new Error('Not Found');
    res.status(404).json({
        error: {
            message: err.message,
        },
    });
};
