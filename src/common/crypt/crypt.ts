/********************************************************************************************************************
 * 암호화 모듈
 * - 암호화 키(key) 를 지정하지 않으면, .env 의 APP_KEY 를 기반으로 AES256 암호화를 수행
 * ******************************************************************************************************************/

import { encode as safeEncode, decode as safeDecode, trim as safeTrim } from 'url-safe-base64';
import aes256 from '../aes256';
import { type Crypt } from './crypt.types';

const crypt: Crypt = {
  /********************************************************************************************************************
   * 인코딩
   * @param plainText 암호화할 텍스트
   * @param key 암호화 키
   * @returns 암호화된 텍스트
   * ******************************************************************************************************************/
  enc(plainText, key = undefined) {
    return safeTrim(safeEncode(aes256.encrypt(key || process.env.APP_KEY, plainText)));
  },

  /********************************************************************************************************************
   * 디코딩
   * @param encryptedText 복호화할 텍스트
   * @param key 복호화 키
   * @returns 복호화된 텍스트
   * ******************************************************************************************************************/
  dec(encryptedText, key = undefined) {
    return aes256.decrypt(key || process.env.APP_KEY, safeDecode(encryptedText));
  },
};

export default crypt;
