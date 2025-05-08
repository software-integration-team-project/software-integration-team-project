import { Router } from 'express';

import commentServices from '../controllers/comments.controller';

const router = Router();
router.get("/:movie_id", commentServices.getCommentsById);
router.post("/:movie_id", commentServices.addComment);

export default router;
