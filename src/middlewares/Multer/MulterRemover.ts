/********************************************************************************************************************
 * Multer 파일 삭제 처리 미들웨어
 * ******************************************************************************************************************/

import { type NextFunction } from 'express';
import fs from 'fs';

export default function (req: MyRequest, res: MyResponse, next: NextFunction) {
  /** 단일 업로드 파일 삭제 */
  try {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) ll('fs.unlink', err);
      });
    }
  } catch {
    //
  }

  /** 다중 업로드 파일 삭제 */
  try {
    if (req.files) {
      if (Array.isArray(req.files)) {
        for (const file of req.files) {
          fs.unlink(file.path, (err) => {
            if (err) ll('fs.unlink', err);
          });
        }
      } else {
        for (const key in req.files) {
          if (Array.isArray(req.files[key])) {
            for (const file of req.files[key]) {
              fs.unlink(file.path, (err) => {
                if (err) ll('fs.unlink', err);
              });
            }
          }
        }
      }
    }
  } catch {
    //
  }

  next();
}
