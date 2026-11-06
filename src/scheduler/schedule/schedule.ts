import _schedule, { type JobCallback } from 'node-schedule';
import { type IJobBase } from '../../scheduler';

/** week */
// 0 : 일요일
// 1 : 월요일
// 2 : 화요일
// 3 : 수요일
// 4 : 목요일
// 5 : 금요일
// 6 : 토요일
// 예) 1-3 : 월요일 ~ 수요일

function callbackRunner(callback: IJobBase): JobCallback {
  return () => {
    callback.$$run();
  };
}

const schedule = {
  /** second */
  secondly(callback: IJobBase) {
    return _schedule.scheduleJob(`* * * * * *`, callbackRunner(callback));
  },
  secondlyInterval(interval: number, callback: IJobBase) {
    return _schedule.scheduleJob(`*/${interval} * * * * *`, callbackRunner(callback));
  },
  /** minute */
  minutely(callback: IJobBase) {
    return _schedule.scheduleJob(`* * * * *`, callbackRunner(callback));
  },
  minutelyInterval(interval: number, callback: IJobBase) {
    return _schedule.scheduleJob(`*/${interval} * * * *`, callbackRunner(callback));
  },
  /** hour */
  hourly(callback: IJobBase) {
    return _schedule.scheduleJob(`0 * * * *`, callbackRunner(callback));
  },
  hourlyInterval(interval: number, callback: IJobBase) {
    return _schedule.scheduleJob(`0 */${interval} * * *`, callbackRunner(callback));
  },
  hourlyAt(minute: number, callback: IJobBase) {
    return _schedule.scheduleJob(`${minute} * * * *`, callbackRunner(callback));
  },
  /** day */
  daily(callback: IJobBase) {
    return _schedule.scheduleJob(`0 0 * * *`, callbackRunner(callback));
  },
  dailyInterval(interval: number, callback: IJobBase) {
    return _schedule.scheduleJob(`0 0 */${interval} * *`, callbackRunner(callback));
  },
  dailyAt(hour: number, minute: number, callback: IJobBase) {
    return _schedule.scheduleJob(`${minute} ${hour} * * *`, callbackRunner(callback));
  },
  /** week */
  weekly(week: number, callback: IJobBase) {
    return _schedule.scheduleJob(`0 0 * * ${week}`, callbackRunner(callback));
  },
  weeklyAt(week: number, hour: number, minute: number, callback: IJobBase) {
    return _schedule.scheduleJob(`${minute} ${hour} * * ${week}`, callbackRunner(callback));
  },
  weeklyHourlyAt(week: number, minute: number, callback: IJobBase) {
    return _schedule.scheduleJob(`${minute} * * * ${week}`, callbackRunner(callback));
  },
  /** month */
  monthly(callback: IJobBase) {
    return _schedule.scheduleJob(`0 0 1 * *`, callbackRunner(callback));
  },
  monthlyInterval(interval: number, callback: IJobBase) {
    return _schedule.scheduleJob(`0 0 1 */${interval} *`, callbackRunner(callback));
  },
  monthlyAt(day: number, hour: number, minute: number, callback: IJobBase) {
    return _schedule.scheduleJob(`${minute} ${hour} ${day} * *`, callbackRunner(callback));
  },
  /** year */
  yearly(callback: IJobBase) {
    return _schedule.scheduleJob(`0 0 1 1 *`, callbackRunner(callback));
  },
  yearlyAt(month: number, day: number, hour: number, minute: number, callback: IJobBase) {
    return _schedule.scheduleJob(`${minute} ${hour} ${day} ${month} *`, callbackRunner(callback));
  },
};

export default schedule;
