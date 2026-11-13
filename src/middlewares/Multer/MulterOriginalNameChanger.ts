import { type NextFunction } from 'express';
import iconv from 'iconv-lite';

export default function (req: MyRequest, res: MyResponse, next: NextFunction) {
  if (req.file) {
    const buffer = Buffer.from(req.file.originalname, 'latin1');
    req.file.originalname = iconv.decode(buffer, 'utf8');
  }

  if (req.files) {
    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        const buffer = Buffer.from(file.originalname, 'latin1');
        file.originalname = iconv.decode(buffer, 'utf8');
      }
    } else {
      for (const fileArray of Object.values(req.files)) {
        for (const file of fileArray) {
          const buffer = Buffer.from(file.originalname, 'latin1');
          file.originalname = iconv.decode(buffer, 'utf8');
        }
      }
    }
  }

  next();
}
