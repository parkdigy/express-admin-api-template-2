import {
  MULTER_MAX_FIELD_ARRAY_INDEX,
  MULTER_MAX_FIELDS,
  MULTER_MAX_FIELD_SIZE_BYTES,
  MULTER_MAX_FILE_SIZE_BYTES,
  default as MulterOptions,
} from '../../../src/middlewares/Multer/MulterOptions';
import { type MyRequest } from '../../../src/@types';

function makeFile(originalname: string, mimetype: string) {
  return { originalname, mimetype, fieldname: 'file' } as Express.Multer.File;
}

describe('MulterOptions', () => {
  it('limits file size to 10MB and bounds multipart fields', () => {
    const options = MulterOptions('@uploads/', 3);

    expect(options.limits).toEqual({
      fieldArrayIndexLimit: MULTER_MAX_FIELD_ARRAY_INDEX,
      fileSize: MULTER_MAX_FILE_SIZE_BYTES,
      files: 3,
      fields: MULTER_MAX_FIELDS,
      parts: 3 + MULTER_MAX_FIELDS,
      fieldNameSize: 100,
      fieldSize: MULTER_MAX_FIELD_SIZE_BYTES,
    });
    expect(MULTER_MAX_FIELD_ARRAY_INDEX).toBe(100);
    expect(MULTER_MAX_FILE_SIZE_BYTES).toBe(10 * 1024 * 1024);
  });

  it.each([
    ['photo.jpg', 'image/jpeg'],
    ['photo.JPEG', 'image/jpeg'],
    ['photo.png', 'image/png'],
    ['photo.webp', 'image/webp'],
    ['document.pdf', 'application/pdf'],
  ])('allows a matching safe file type: %s', (originalname, mimetype) => {
    const callback = jest.fn();

    MulterOptions('@uploads/', 1).fileFilter?.({} as MyRequest, makeFile(originalname, mimetype), callback);

    expect(callback).toHaveBeenCalledWith(null, true);
  });

  it.each([
    ['malware.exe', 'application/octet-stream'],
    ['script.html', 'text/html'],
    ['spoofed.exe', 'image/jpeg'],
    ['spoofed.jpg', 'application/octet-stream'],
    ['double.jpg.exe', 'image/jpeg'],
  ])('rejects a disallowed or mismatched file type: %s', (originalname, mimetype) => {
    const callback = jest.fn();

    MulterOptions('@uploads/', 1).fileFilter?.({} as MyRequest, makeFile(originalname, mimetype), callback);

    expect(callback).toHaveBeenCalledWith(expect.any(Error));
  });

  it.each([0, -1, 1.5, Number.NaN])('rejects an invalid maxFiles value: %s', (maxFiles) => {
    expect(() => MulterOptions('@uploads/', maxFiles)).toThrow('maxFiles 는 1 이상의 정수여야 합니다.');
  });
});
