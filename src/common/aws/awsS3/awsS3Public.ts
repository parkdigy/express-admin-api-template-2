/********************************************************************************************************************
 * AWS S3 모듈 (Public)
 * ******************************************************************************************************************/

import {
  S3Client,
  HeadObjectCommand,
  type PutObjectCommandInput,
  PutObjectCommand,
  DeleteObjectCommand,
  NotFound,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { downloadDataFromUrl, parseDownloadUrl } from './downloadDataFromUrl';

let s3: S3Client;

/** S3 클라이언드 객체 생성 */
if (notEmpty(process.env.S3_KEY) && notEmpty(process.env.S3_SECRET) && notEmpty(process.env.S3_REGION)) {
  s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_KEY,
      secretAccessKey: process.env.S3_SECRET,
    },
    region: process.env.S3_REGION,
  });
}

const awsS3Public = {
  /********************************************************************************************************************
   * 파일 존재 여부 : IAM 의 s3:ListBucket 권한이 필요함
   * @param s3PathFileName S3 경로 및 파일명
   * @returns 파일 존재 여부
   * ******************************************************************************************************************/
  exists(s3PathFileName: string) {
    return new Promise<boolean>((resolve, reject) => {
      const command = new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: util.url.join(process.env.S3_PATH || '', s3PathFileName),
      });

      s3.send(command)
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          if (err && err instanceof NotFound) {
            resolve(false);
          } else if (err) {
            reject(true);
          }
        });
    });
  },

  /********************************************************************************************************************
   * Multer 파일 업로드
   * @param file Multer 파일
   * @param s3Path S3 경로
   * @param s3FileName S3 파일명
   * @returns S3 URL
   * ******************************************************************************************************************/
  uploadMulterFile(file: Express.Multer.File, s3Path = '/', s3FileName?: string) {
    if (!s3) throw new Error('env 에 S3 (Public) 정보를 등록해야합니다.');
    if (empty(process.env.S3_BUCKET)) throw new Error('env 에 S3_BUCKET 값을 등록해야 합니다.');

    return new Promise<string>((resolve, reject) => {
      const { originalname: originalName, mimetype: mimeType, path: localFilePath } = file;

      let ext: string | false = path.extname(originalName);
      if (empty(ext)) {
        ext = util.file.mimeTypeExtension(mimeType, true);
      }

      if (!ext || empty(ext)) {
        reject(new Error('s3Upload.uploadMulterFile : 확장자명 없음'));
      } else {
        try {
          if (empty(s3FileName)) {
            s3FileName = util.file.randomName(ext);
          }

          const s3PathName = util.url.join(process.env.S3_PATH || '', s3Path, s3FileName);

          const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3PathName,
            ACL: 'public-read',
            Body: fs.createReadStream(localFilePath),
            ContentType: mimeType,
          });

          s3.send(command)
            .then((data) => {
              if (data.$metadata.httpStatusCode === 200) {
                resolve(this.getFullUrl(s3PathName));
              } else {
                reject(new Error(`(HTTP-${data.$metadata.httpStatusCode}) Upload Error!`));
              }
            })
            .catch((err) => reject(err));
        } catch (err) {
          reject(err);
        }
      }
    });
  },

  /********************************************************************************************************************
   * 데이터 업로드
   * @param data 업로드 데이터
   * @param mimeType MIME 타입
   * @param s3Path S3 경로
   * @param s3FileName S3 파일명
   * @returns S3 URL
   * ******************************************************************************************************************/
  uploadData(
    data: Exclude<PutObjectCommandInput['Body'], undefined>,
    mimeType: string,
    s3Path = '/',
    s3FileName?: string
  ) {
    if (!s3) throw new Error('env 에 S3 (Public) 정보를 등록해야합니다.');
    if (empty(process.env.S3_BUCKET)) throw new Error('env 에 S3_BUCKET 값을 등록해야 합니다.');

    return new Promise<string>((resolve, reject) => {
      const ext: string | false = util.file.mimeTypeExtension(mimeType);
      if (!ext || empty(ext)) {
        reject(new Error('s3Upload.uploadData : 확장자명 없음'));
      } else {
        try {
          if (empty(s3FileName)) {
            s3FileName = util.file.randomName(ext);
          }

          const s3PathName = util.url.join(process.env.S3_PATH || '', s3Path, s3FileName);

          const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3PathName,
            ACL: 'public-read',
            Body: data,
            ContentType: mimeType,
          });

          s3.send(command)
            .then((data) => {
              if (data.$metadata.httpStatusCode === 200) {
                resolve(this.getFullUrl(s3PathName));
              } else {
                reject(new Error(`(HTTP-${data.$metadata.httpStatusCode}) Upload Error!`));
              }
            })
            .catch((err) => reject(err));
        } catch (err) {
          reject(err);
        }
      }
    });
  },

  /********************************************************************************************************************
   * URL 업로드
   * @param url URL
   * @param mimeType MIME 타입
   * @param s3Path S3 경로
   * @param s3FileName S3 파일명
   * @returns S3 URL
   * ******************************************************************************************************************/
  uploadUrl(url: string, mimeType?: string, s3Path = '/', s3FileName?: string) {
    if (!s3) throw new Error('env 에 S3 (Public) 정보를 등록해야합니다.');
    if (empty(process.env.S3_BUCKET)) throw new Error('env 에 S3_BUCKET 값을 등록해야 합니다.');

    return new Promise<string>((resolve, reject) => {
      let ext: string | false = path.extname(parseDownloadUrl(url).pathname);
      if (empty(ext) && notEmpty(mimeType)) {
        ext = util.file.mimeTypeExtension(mimeType);
      }

      if (!ext || empty(ext)) {
        reject(new Error('s3Upload.uploadUrl : 확장자명 없음'));
      } else {
        if (empty(mimeType)) {
          mimeType = util.file.mimeType(ext);
        }

        try {
          return downloadDataFromUrl(url)
            .then((data) => {
              if (empty(s3FileName)) {
                s3FileName = util.file.randomName(ext);
              }

              const s3PathName = util.url.join(process.env.S3_PATH || '', s3Path, s3FileName);

              const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET,
                Key: s3PathName,
                ACL: 'public-read',
                Body: data,
                ContentType: mimeType,
              });

              s3.send(command)
                .then((data) => {
                  if (data.$metadata.httpStatusCode === 200) {
                    resolve(this.getFullUrl(s3PathName));
                  } else {
                    reject(new Error(`(HTTP-${data.$metadata.httpStatusCode}) Upload Error!`));
                  }
                })
                .catch((err) => reject(err));
            })
            .catch((err) => {
              reject(err);
            });
        } catch (err) {
          reject(err);
        }
      }
    });
  },

  /********************************************************************************************************************
   * URL로 파일 삭제
   * @param url S3 파일의 전체 URL
   * ******************************************************************************************************************/
  deleteUrl(url: string) {
    if (!s3) throw new Error('env 에 S3 (Public) 정보를 등록해야합니다.');
    if (empty(process.env.S3_BUCKET)) throw new Error('env 에 S3_BUCKET 값을 등록해야 합니다.');

    return new Promise<boolean>((resolve, reject) => {
      try {
        const bucket = process.env.S3_BUCKET;

        const prefix = `https://${bucket}.s3.amazonaws.com/`;
        if (!url.startsWith(prefix)) {
          return reject(new Error('S3 URL 형식이 올바르지 않습니다.'));
        }

        const key = url.substring(prefix.length);

        if (empty(key)) {
          return reject(new Error('URL에서 S3 객체 키(Key)를 추출할 수 없습니다.'));
        }

        const command = new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        });

        s3.send(command)
          .then(() => {
            resolve(true);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (err) {
        reject(err);
      }
    });
  },

  /********************************************************************************************************************
   * S3의 전체 URL 반환
   * @param path S3 파일 경로
   * @returns 전체 URL
   * ******************************************************************************************************************/
  getFullUrl(path: string) {
    return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${path}`;
  },

  /********************************************************************************************************************
   * URL 교체
   * @param url URL
   * @param baseUrl 기본 URL
   * @param replaceUrl 교체 URL
   * @returns 교체된 URL
   * ******************************************************************************************************************/
  replaceUrl(url: string, baseUrl?: string, replaceUrl?: string) {
    if (baseUrl == null) {
      baseUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com`;
    }
    if (replaceUrl == null) {
      replaceUrl = process.env.S3_REPLACE_URL;
    }
    if (notEmpty(baseUrl) && notEmpty(replaceUrl)) {
      return url.replace(baseUrl, replaceUrl);
    } else {
      return url;
    }
  },
};

export default awsS3Public;
