/********************************************************************************************************************
 * 배포 라우터
 * ******************************************************************************************************************/

import express from 'express';
import { Deploy } from '@controllers';
import { Controller } from '@middlewares';

const router = express.Router();

// github
router.post('/github', Controller(Deploy.github));

export default router;
