/********************************************************************************************************************
 * Multer 파일 업로드 처리 미들웨어
 * - 다중 파일 업로드 처리
 * ******************************************************************************************************************/
import multer from 'multer';
import MulterOptions from './MulterOptions';

export default function (maxCount: number, name = 'files', dest = '@uploads/') {
  return multer(MulterOptions(dest, maxCount, 1024 * 1024 * 50)).array(name, maxCount);
}
