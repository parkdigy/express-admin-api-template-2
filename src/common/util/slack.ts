/********************************************************************************************************************
 * Slack 모듈
 * ******************************************************************************************************************/

import axios from 'axios';

type Blocks = Dict | '-' | string | (Dict | '-' | string)[];

export default {
  /********************************************************************************************************************
   * 서버 에러 전송
   * ******************************************************************************************************************/
  sendServerErrorAlarm(msgBlocks: Blocks) {
    if (notEmpty(process.env.SLACK_ALARM_WEB_HOOK_URL)) {
      axios.post(
        process.env.SLACK_ALARM_WEB_HOOK_URL,
        {
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `:warning: *${env.title} (${env.env})*`,
              },
            },
            ...makeBlocks(msgBlocks),
          ],
        },
        {
          timeout: 1000 * 60,
        }
      );
    }
  },

  /********************************************************************************************************************
   * 서버 알림 전송
   * ******************************************************************************************************************/
  sendServerAlarm(msgBlocks: Blocks) {
    try {
      if (notEmpty(process.env.SLACK_ALARM_WEB_HOOK_URL)) {
        axios
          .post(
            process.env.SLACK_ALARM_WEB_HOOK_URL,
            {
              blocks: makeBlocks(msgBlocks),
            },
            {
              timeout: 1000 * 60,
            }
          )
          .then(() => {
            //
          });
      }
    } catch (err) {
      ll(err);
    }
  },

  /********************************************************************************************************************
   * 관리자 알림 전송
   * ******************************************************************************************************************/
  sendAdminAlarm(msgBlocks: Blocks) {
    try {
      if (notEmpty(process.env.SLACK_ADMIN_ALARM_WEB_HOOK_URL)) {
        axios
          .post(
            process.env.SLACK_ADMIN_ALARM_WEB_HOOK_URL,
            {
              blocks: makeBlocks(msgBlocks),
            },
            {
              timeout: 1000 * 60,
            }
          )
          .then(() => {
            //
          });
      }
    } catch (err) {
      ll(err);
    }
  },
};

/********************************************************************************************************************
 * Slack 메시지 블록 생성
 * ******************************************************************************************************************/
const makeBlocks = (blocks: Blocks) => {
  const finalBlocks: Dict[] = [];

  if (Array.isArray(blocks)) {
    blocks.forEach((b) => {
      if (b != null) {
        if (typeof b === 'object') {
          finalBlocks.push(b);
        } else if (b === '-') {
          finalBlocks.push({
            type: 'divider',
          });
        } else {
          finalBlocks.push({
            type: 'section',
            text: {
              type: 'plain_text',
              text: b,
            },
          });
        }
      }
    });
  } else {
    if (blocks != null) {
      if (typeof blocks === 'object') {
        finalBlocks.push(blocks);
      } else if (blocks === '-') {
        finalBlocks.push({
          type: 'divider',
        });
      } else {
        finalBlocks.push({
          type: 'section',
          text: {
            type: 'plain_text',
            text: blocks,
          },
        });
      }
    }
  }

  finalBlocks.push({
    type: 'divider',
  });

  return finalBlocks;
};
