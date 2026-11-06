import express from 'express';
import { Logger, ApiJwtCookieAuthChecker } from '@middlewares';
import Ping from './Ping';
import Deploy from './Deploy';
import Auth from './Auth';
import Admin from './Admin';
import PrivacyAccess from './PrivacyAccess';
import My from './My';
import Export from './export';

const router = express.Router();

router.use('/deploy', Logger(), Deploy);
router.use('/ping', Ping);
router.use('/auth', Auth);

router.use('/export', ApiJwtCookieAuthChecker, Export);
router.use('/admin', ApiJwtCookieAuthChecker, Admin);
router.use('/privacy_access', ApiJwtCookieAuthChecker, PrivacyAccess);
router.use('/my', ApiJwtCookieAuthChecker, My);

export default router;
