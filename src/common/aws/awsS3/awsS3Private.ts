/********************************************************************************************************************
 * AWS S3 모듈 (Private)
 * ******************************************************************************************************************/

import {
  S3Client,
  HeadObjectCommand,
  type PutObjectCommandInput,
  GetObjectCommand,
  type GetObjectCommandOutput,
  PutObjectCommand,
  DeleteObjectCommand,
  NotFound,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { downloadDataFromUrl, parseDownloadUrl } from './downloadDataFromUrl';

let s3: S3Client;

/** S3 클라이언드 객체 생성 */
if (
  notEmpty(process.env.S3_PRIVATE_KEY) &&
  notEmpty(process.env.S3_PRIVATE_SECRET) &&
  notEmpty(process.env.S3_PRIVATE_REGION)
) {
  s3 = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_PRIVATE_KEY,
      secretAccessKey: process.env.S3_PRIVATE_SECRET,
    },
    region: process.env.S3_PRIVATE_REGION,
  });
}

export const awsS3Private = {
  /********************************************************************************************************************
   * 파일 존재 여부 : IAM 의 s3:ListBucket 권한이 필요함
   * @param s3PathFileName S3 경로 및 파일명
   * @returns 파일 존재 여부
   * ******************************************************************************************************************/
  exists(s3PathFileName: string) {
    return new Promise<boolean>((resolve, reject) => {
      const command = new HeadObjectCommand({
        Bucket: process.env.S3_PRIVATE_BUCKET,
        Key: util.url.join(process.env.S3_PRIVATE_PATH || '', s3PathFileName),
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
   * 파일 업로드 (Multer)
   * @param file 업로드 파일
   * @param s3Path S3 경로
   * @param s3FileName S3 파일명
   * @returns S3 URL
   * ******************************************************************************************************************/
  uploadMulterFile(file: Express.Multer.File, s3Path = '/', s3FileName?: string) {
    if (!s3) throw new Error('env 에 S3 (Private) 정보를 등록해야합니다.');
    if (empty(process.env.S3_PRIVATE_BUCKET)) throw new Error('env 에 S3_PRIVATE_BUCKET 값을 등록해야 합니다.');

    return new Promise<{ pathName: string; fileName: string }>((resolve, reject) => {
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

          const s3PathName = util.url.join(process.env.S3_PRIVATE_PATH || '', s3Path);

          const command = new PutObjectCommand({
            Bucket: process.env.S3_PRIVATE_BUCKET,
            Key: util.url.join(s3PathName, s3FileName),
            Body: fs.createReadStream(localFilePath),
            ContentType: mimeType,
          });

          s3.send(command)
            .then((data) => {
              if (data.$metadata.httpStatusCode === 200) {
                resolve({ pathName: s3PathName, fileName: s3FileName as string });
              } else {
                reject(new Error(`(HTTP-${data.$metadata.httpStatusCode}) Upload Error!`));
              }
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
    if (!s3) throw new Error('env 에 S3 (Private) 정보를 등록해야합니다.');
    if (empty(process.env.S3_PRIVATE_BUCKET)) throw new Error('env 에 S3_PRIVATE_BUCKET 값을 등록해야 합니다.');

    return new Promise<{ pathName: string; fileName: string }>((resolve, reject) => {
      const ext: string | false = util.file.mimeTypeExtension(mimeType);
      if (!ext || empty(ext)) {
        reject(new Error('s3Upload.uploadData : 확장자명 없음'));
      } else {
        try {
          if (empty(s3FileName)) {
            s3FileName = util.file.randomName(ext);
          }

          const s3PathName = util.url.join(process.env.S3_PRIVATE_PATH || '', s3Path);

          const command = new PutObjectCommand({
            Bucket: process.env.S3_PRIVATE_BUCKET,
            Key: util.url.join(s3PathName, s3FileName),
            Body: data,
            ContentType: mimeType,
          });

          s3.send(command)
            .then((data) => {
              if (data.$metadata.httpStatusCode === 200) {
                resolve({ pathName: s3PathName, fileName: s3FileName as string });
              } else {
                reject(new Error(`(HTTP-${data.$metadata.httpStatusCode}) Upload Error!`));
              }
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
   * URL 업로드
   * @param url 업로드 URL
   * @param mimeType MIME 타입
   * @param s3Path S3 경로
   * @param s3FileName S3 파일명
   * @returns S3 URL
   * ******************************************************************************************************************/
  uploadUrl(url: string, mimeType?: string, s3Path = '/', s3FileName?: string) {
    if (!s3) throw new Error('env 에 S3 (Private) 정보를 등록해야합니다.');
    if (empty(process.env.S3_PRIVATE_BUCKET)) throw new Error('env 에 S3_PRIVATE_BUCKET 값을 등록해야 합니다.');

    return new Promise<{ pathName: string; fileName: string }>((resolve, reject) => {
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

              const s3PathName = util.url.join(process.env.S3_PRIVATE_PATH || '', s3Path);

              const command = new PutObjectCommand({
                Bucket: process.env.S3_PRIVATE_BUCKET,
                Key: util.url.join(s3PathName, s3FileName),
                Body: data,
                ContentType: mimeType,
              });

              s3.send(command)
                .then((data) => {
                  if (data.$metadata.httpStatusCode === 200) {
                    resolve({ pathName: s3PathName, fileName: s3FileName as string });
                  } else {
                    reject(new Error(`(HTTP-${data.$metadata.httpStatusCode}) Upload Error!`));
                  }
                })
                .catch((err) => {
                  reject(err);
                });
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
   * 파일 다운로드
   * @param s3Path S3 경로
   * @param s3FileName S3 파일명
   * @param notUseS3Path env 에서 지정한 S3_PATH 미사용 여부
   * @returns 파일 데이터
   * ******************************************************************************************************************/
  getObject(s3Path: string, s3FileName: string, notUseS3Path = false) {
    if (!s3) throw new Error('env 에 S3 (Private) 정보를 등록해야합니다.');
    if (empty(process.env.S3_PRIVATE_BUCKET)) throw new Error('env 에 S3_PRIVATE_BUCKET 값을 등록해야 합니다.');

    return new Promise<GetObjectCommandOutput>((resolve, reject) => {
      s3.send(
        new GetObjectCommand({
          Bucket: process.env.S3_PRIVATE_BUCKET,
          Key: util.url.join(notUseS3Path ? '' : ifEmpty(process.env.S3_PATH, ''), s3Path, s3FileName),
        })
      )
        .then((data) => {
          resolve(data);
        })
        .catch((err) => reject(err));
    });
  },

  /********************************************************************************************************************
   * 파일 삭제
   * @param s3Path S3 경로
   * @param s3FileName S3 파일명
   * @param notUseS3Path env 에서 지정한 S3_PATH 미사용 여부
   * ******************************************************************************************************************/
  deleteObject(s3Path: string, s3FileName: string, notUseS3Path = false) {
    if (!s3) throw new Error('env 에 S3 (Private) 정보를 등록해야합니다.');
    if (empty(process.env.S3_PRIVATE_BUCKET)) throw new Error('env 에 S3_PRIVATE_BUCKET 값을 등록해야 합니다.');

    return new Promise<boolean>((resolve, reject) => {
      try {
        const key = util.url.join(notUseS3Path ? '' : ifEmpty(process.env.S3_PATH, ''), s3Path, s3FileName);

        const command = new DeleteObjectCommand({
          Bucket: process.env.S3_PRIVATE_BUCKET,
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
};

export default awsS3Private;
