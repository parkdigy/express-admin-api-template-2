import _dayjs from 'dayjs';

declare global {
  var dayjs: typeof _dayjs;
}

globalThis.dayjs = _dayjs;

export {};
