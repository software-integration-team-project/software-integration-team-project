import { Router } from 'express';

const router = Router();

router.get('/api/health', (_, res) => {
    res.status(200).json({
        message: 'All up and running !!',
    });
});

export default router;
