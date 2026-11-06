import express from 'express';
import { Logger, LocalChecker } from '@middlewares';
import Deploy from './Deploy';
import Test from './Test';

const router = express.Router();

router.use('/deploy', Logger(), Deploy);

if (env.isLocal) {
  router.use('/test', LocalChecker, Test);
}

export default router;
