/********************************************************************************************************************
 * aes256 모듈
 * ******************************************************************************************************************/

import crypto from 'crypto';
import { type Aes256 } from './aes256.types';

const CIPHER_ALGORITHM = 'aes-256-ctr';

/********************************************************************************************************************
 * 인코딩
 * ******************************************************************************************************************/
function encrypt(key: string, input: string): string;
function encrypt(key: string, input: Buffer): Buffer;
function encrypt(key: string, input: string | Buffer): string | Buffer {
  if (empty(key)) {
    throw new TypeError('Provided "key" must be a non-empty string');
  }

  const isString = typeof input === 'string';
  const isBuffer = Buffer.isBuffer(input);
  if (!(isString || isBuffer) || (isString && !input) || (isBuffer && !Buffer.byteLength(input))) {
    throw new TypeError('Provided "input" must be a non-empty string or buffer');
  }

  const sha256 = crypto.createHash('sha256');
  sha256.update(key);

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, sha256.digest(), iv);

  let buffer = input;
  if (isString) {
    buffer = Buffer.from(input);
  }

  const ciphertext = cipher.update(buffer);
  const encrypted = Buffer.concat([iv, ciphertext, cipher.final()]);

  return isString ? encrypted.toString('base64') : encrypted;
}

/********************************************************************************************************************
 * 디코딩
 * ******************************************************************************************************************/
function decrypt(key: string, encrypted: string): string;
function decrypt(key: string, encrypted: Buffer): Buffer;
function decrypt(key: string, encrypted: string | Buffer): string | Buffer {
  if (empty(key)) {
    throw new TypeError('Provided "key" must be a non-empty string');
  }

  const isString = typeof encrypted === 'string';
  const isBuffer = Buffer.isBuffer(encrypted);
  if (!(isString || isBuffer) || (isString && !encrypted) || (isBuffer && !Buffer.byteLength(encrypted))) {
    throw new TypeError('Provided "encrypted" must be a non-empty string or buffer');
  }

  const sha256 = crypto.createHash('sha256');
  sha256.update(key);

  let inputBuffer: Buffer;
  if (isString) {
    inputBuffer = Buffer.from(encrypted, 'base64');
    if (inputBuffer.length < 17) {
      throw new TypeError('Provided "encrypted" must decrypt to a non-empty string or buffer');
    }
  } else {
    inputBuffer = encrypted;
    if (Buffer.byteLength(encrypted) < 17) {
      throw new TypeError('Provided "encrypted" must decrypt to a non-empty string or buffer');
    }
  }

  const iv = inputBuffer.subarray(0, 16);
  const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, sha256.digest(), iv);

  const ciphertext = inputBuffer.subarray(16);

  if (isString) {
    return decipher.update(ciphertext).toString() + decipher.final().toString();
  } else {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  }
}

const aes256: Aes256 = {
  encrypt,
  decrypt,
};

export default aes256;
