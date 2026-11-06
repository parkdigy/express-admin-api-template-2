/********************************************************************************************************************
 * Multer 파일 업로드 처리 미들웨어
 * - 단일 파일 업로드 처리
 * ******************************************************************************************************************/

import multer from 'multer';
import MulterOptions from './MulterOptions';

export default function (name = 'file', dest = '@uploads/') {
  return multer(MulterOptions(dest, 1)).single(name);
}
