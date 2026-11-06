import path from 'node:path';
import { type Options } from 'multer';

export const MULTER_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MULTER_MAX_FIELDS = 20;
export const MULTER_MAX_FIELD_SIZE_BYTES = 1024 * 1024;
export const MULTER_MAX_FIELD_ARRAY_INDEX = 100;

export const MULTER_ALLOWED_FILE_TYPES: Readonly<Record<string, readonly string[]>> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
  'application/x-hwp': ['.hwp'],
  'application/x-hwp; charset=UTF-8': ['.hwp'],
  'application/haansoft-hwp': ['.hwp'],
  'application/hwp+zip': ['.hwpx'],
  'application/x-hwpx': ['.hwpx'],
};

export default function (dest: string, maxFiles: number, maxSize = MULTER_MAX_FILE_SIZE_BYTES): Options {
  if (!Number.isInteger(maxFiles) || maxFiles < 1) {
    throw new TypeError('maxFiles 는 1 이상의 정수여야 합니다.');
  }

  const limits: NonNullable<Options['limits']> & { fieldArrayIndexLimit: number } = {
    fieldArrayIndexLimit: MULTER_MAX_FIELD_ARRAY_INDEX,
    fileSize: maxSize,
    files: maxFiles,
    fields: MULTER_MAX_FIELDS,
    parts: maxFiles + MULTER_MAX_FIELDS,
    fieldNameSize: 100,
    fieldSize: MULTER_MAX_FIELD_SIZE_BYTES,
  };

  return {
    dest,
    limits,
    fileFilter(_req, file, callback) {
      const allowedExtensions = MULTER_ALLOWED_FILE_TYPES[file.mimetype.toLowerCase()];
      const extension = path.extname(file.originalname).toLowerCase();

      if (!allowedExtensions?.includes(extension)) {
        callback(new Error('허용되지 않은 파일 형식입니다.'));
        return;
      }

      callback(null, true);
    },
  };
}
