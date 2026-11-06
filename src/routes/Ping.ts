/********************************************************************************************************************
 * Ping 라우터
 * ******************************************************************************************************************/
import express from 'express';
import { ApiController } from '@middlewares';

const router = express.Router();

router.get(
  '/',
  ApiController((req: MyRequest, res: MyResponse) => {
    res.send(req.$$remoteIpAddress ? `pong : ${req.$$remoteIpAddress}` : 'pong');
  })
);

export default router;
