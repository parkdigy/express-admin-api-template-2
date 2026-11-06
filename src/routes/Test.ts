/********************************************************************************************************************
 * Test 라우터
 * ******************************************************************************************************************/

import express from 'express';
import { TestHome, TestAuth } from '@controllers';
import { Controller, JwtCookieAuthChecker } from '@middlewares';

const router = express.Router();

// 홈 화면 HTML
router.get('/', JwtCookieAuthChecker, Controller(TestHome.getHtml, true));
// 로그인 화면 HTML
router.get('/signin', Controller(TestAuth.getSignInHtml));
// 로그인
router.post('/signin', Controller(TestAuth.signIn));
// 로그아웃
router.post('/signout', Controller(TestAuth.signOut));
// 회원가입 화면 HTML
router.get('/signup', Controller(TestAuth.getSignUpHtml));
// 회원가입
router.post('/signup', Controller(TestAuth.signUp));

export default router;
