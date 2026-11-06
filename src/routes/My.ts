/********************************************************************************************************************
 * 내 정보 라우터
 * ******************************************************************************************************************/

import express from 'express';
import { My } from '@controllers';
import { ApiController } from '@middlewares';

const router = express.Router();

// 비밀번호 변경
router.patch('/password', ApiController(My.passwordChange, true));
// API 호출 권한 등록
router.post('/permission', ApiController(My.apiCallPermission));

export default router;
