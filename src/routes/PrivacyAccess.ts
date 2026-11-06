/********************************************************************************************************************
 * 내 정보 라우터
 * ******************************************************************************************************************/

import express from 'express';
import { PrivacyAccess } from '@controllers';
import { ApiControllerReadRole } from '@middlewares';

const router = express.Router();

// 개인정보
router.get('/', ApiControllerReadRole(menu.all, PrivacyAccess.info));

export default router;
