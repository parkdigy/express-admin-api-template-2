import express from 'express';
import { Logger } from '@middlewares';
import Ping from './Ping';
import Deploy from './Deploy';
import Auth from './Auth';

const router = express.Router();

router.use('/deploy', Logger(), Deploy);
router.use('/ping', Ping);
router.use('/auth', Auth);

export default router;
