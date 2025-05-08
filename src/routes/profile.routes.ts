import { Router } from 'express';

import profileServices from '../controllers/profile.controller';

const router = Router();

router.put("/", profileServices.editPassword);
router.post("/", profileServices.logout);

export default router;
