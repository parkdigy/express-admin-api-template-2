/********************************************************************************************************************
 * 인증 라우터
 * ******************************************************************************************************************/

import express from 'express';
import { Auth } from '@controllers';
import { ApiController, ApiJwtCookieAuthChecker } from '@middlewares';

const router = express.Router();

// 로그인 정보
router.get('/signin', ApiJwtCookieAuthChecker, ApiController(Auth.getInfo));
// 로그인
router.post('/signin', ApiController(Auth.signIn));
// 로그아웃
router.post('/signout', ApiController(Auth.signOut));

export default router;
