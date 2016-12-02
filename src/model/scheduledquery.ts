import { ScheduledTime } from './scheduledtime';
import { RecurrenceRule, RecurrenceSpec, Range } from 'node-schedule';

export class ScheduledQuery {
  public static ONCEADAY: string = 'ONCEADAY';
  public static REPEAT: string = 'REPEAT';

  id: number;
  groupName: string;
  processName: string;
  serviceName: string;
  frequency: number; // in minutes
  start: ScheduledTime;
  end: ScheduledTime;
  dayOfWeek: number[] = [1, 2, 3, 4, 5];
  scheduleType: string;
  successMessage: string;
  failureMessage: string;
  query: string;
  helpUrl: string;
  statusUrl: string;

  constructor(fields: any) {
    Object.assign(this, fields);

    if (this.scheduleType === ScheduledQuery.REPEAT) {
      // set some defaults
      this.start = new ScheduledTime();
      this.end = new ScheduledTime(23, 59, 59);
    }

    if (fields.hasOwnProperty('startHour') &&
      fields.hasOwnProperty('startMinute') &&
      fields.hasOwnProperty('startSecond')) {
      this.start = new ScheduledTime(fields.startHour, fields.startMinute, fields.startSecond);
    }

    if (fields.scheduleType === ScheduledQuery.REPEAT &&
      fields.hasOwnProperty('endHour') &&
      fields.hasOwnProperty('endMinute') &&
      fields.hasOwnProperty('endSecond')) {
      this.end = new ScheduledTime(fields.endHour, fields.endMinute, fields.endSecond);
    }
  }

  static fromSqlResults(result: any[]): ScheduledQuery[] {
    let squerys: ScheduledQuery[] = [];
    for (let item of result) {
      squerys.push(new ScheduledQuery(item));
    }
    return squerys;
  }

  getRecurrenceRules(): RecurrenceSpec[] {
    if (this.scheduleType === ScheduledQuery.ONCEADAY) {
      return [{
        dayOfWeek: this.dayOfWeek,
        hour: this.start.hour,
        minute: this.start.minute,
        second: this.start.second
      }];
    }

    if (this.scheduleType === ScheduledQuery.REPEAT) {

      let rules: RecurrenceSpec[] = [],
        currentMinutes = this.start.totalMinutes(),
        endMinutes = this.end.totalMinutes();


      while (currentMinutes <= endMinutes) {
        let ruleTime = new ScheduledTime(0, currentMinutes)
        rules.push({
          dayOfWeek: this.dayOfWeek,
          hour: ruleTime.hour,
          minute: ruleTime.minute,
          second: ruleTime.second
        });
        currentMinutes += this.frequency;
      }

      return rules;
    }

    return null;
  }
}