/********************************************************************************************************************
 * 파일 모듈
 * ******************************************************************************************************************/

import mime from 'mime-types';
import path from 'path';
import dayjs from 'dayjs';
import fs from 'fs';
import { uuid } from './uuid';

export const file = {
  /********************************************************************************************************************
   * MIME 타입 반환
   * @param name 파일명, URL
   * @returns MIME 타입
   * ******************************************************************************************************************/
  mimeType(name: string) {
    return mime.lookup(name) || 'application/octet-stream';
  },

  /********************************************************************************************************************
   * 파일명, URL 의 확장자 반환
   * @param fileName 파일명, URL
   * @returns 확장자
   * ******************************************************************************************************************/
  extName(fileName: string) {
    return path.extname(fileName);
  },

  /********************************************************************************************************************
   * MIME 타입에 맞는 확장자 반환
   * @param mimeType MIME 타입
   * @param addDot '.'을 추가할지 여부
   * @returns 확장자
   * ******************************************************************************************************************/
  mimeTypeExtension(mimeType: string, addDot = true) {
    let ext = mime.extension(mimeType);
    if (ext === 'jpeg') ext = 'jpg';
    return ext && addDot ? `.${ext}` : ext || '';
  },

  /********************************************************************************************************************
   * 무작위 파일명 생성
   * - 기본 구조 : 'YYYYMMDDHHmmss_UUID_랜덤숫자.확장자'
   * @param ext 확장자
   * @returns 파일명
   * ******************************************************************************************************************/
  randomName(ext: string) {
    const isEmptyExt = ext === '';
    if (!isEmptyExt && !ext.startsWith('.')) ext = `.${ext}`;
    const dt = dayjs().format('YYYYMMDDHHmmss');
    const rnd = Math.floor(Math.random() * 100000);
    return `${dt}_${uuid(true)}_${rnd}${isEmptyExt ? '' : ext}`;
  },

  /********************************************************************************************************************
   * 폴더 삭제 (하위 파일/디렉토리 포함)
   * @param directoryPath 디렉토리
   * @returns Promise<void>
   * ******************************************************************************************************************/
  deleteDirectoryRecursive(directoryPath: string) {
    try {
      const files = fs.readdirSync(directoryPath);

      for (const file of files) {
        const currentPath = path.join(directoryPath, file);
        const fileStat = fs.lstatSync(currentPath);

        if (fileStat.isDirectory()) {
          this.deleteDirectoryRecursive(currentPath);
        } else {
          fs.unlinkSync(currentPath);
        }
      }

      fs.rmdirSync(directoryPath);
    } catch (err) {
      console.error(`Error while deleting ${directoryPath}.`, err);
    }
  },
};

export default file;
