/********************************************************************************************************************
 * 이메일 전송을 위한 모듈
 * ******************************************************************************************************************/

import nodemailer, { type Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import Mail from 'nodemailer/lib/mailer';
import internal from 'stream';

let transporter: Transporter;

if (notEmpty(process.env.MAIL_HOST) && notEmpty(process.env.MAIL_PORT)) {
  const options: SMTPTransport.Options = {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: ['1', 'true', 'TRUE'].includes(process.env.MAIL_SECURE),
  };

  if (notEmpty(process.env.MAIL_USERNAME)) {
    options.auth = {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    };
  }

  transporter = nodemailer.createTransport(options);
}

const mail = {
  /********************************************************************************************************************
   * send
   * ******************************************************************************************************************/
  async send(
    to: string | Mail.Address | (string | Mail.Address)[],
    subject: string,
    body: string | internal.Readable | Buffer | Mail.AttachmentLike,
    isHtml = false,
    from?: string | Mail.Address
  ) {
    if (!transporter) {
      throw new Error('common:mail - env 에 MAIL_HOST, MAIL_PORT 를 지정해야합니다.');
    }

    const sendData: Mail.Options = {
      to,
      subject: subject,
    };

    if (from) {
      sendData.from = from;
    } else {
      if (notEmpty(process.env.MAIL_FROM_NAME)) {
        if (notEmpty(process.env.MAIL_FROM_EMAIL)) {
          sendData.from = {
            name: process.env.MAIL_FROM_NAME,
            address: process.env.MAIL_FROM_EMAIL,
          };
        } else if (notEmpty(process.env.MAIL_USERNAME)) {
          sendData.from = {
            name: process.env.MAIL_FROM_NAME,
            address: process.env.MAIL_USERNAME,
          };
        } else {
          throw new Error('common:mail - from 을 설정할 수 없습니다.');
        }
      }
    }

    if (isHtml) {
      sendData.html = body;
    } else {
      sendData.text = body;
    }

    return await transporter.sendMail(sendData);
  },
};

export default mail;
