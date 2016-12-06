import { ScheduledTime } from './scheduledtime';
import { RecurrenceRule, RecurrenceSpec, Range } from 'node-schedule';
import { Alert } from './alert';

export class ScheduledQuery {
  public static ONCE: string = 'ONCE';
  public static REPEAT: string = 'REPEAT';

  id: string;
  groupName: string;
  serviceName: string;
  helpUrl: string;
  statusUrl: string;
  query: string;
  successMessage: string;
  failureMessage: string;
  frequency: number; // in minutes
  start: ScheduledTime;
  end: ScheduledTime;
  dayOfWeek: number[];
  scheduleType: string;
  businessImpact: string;
  technicalImpact: string;
  severity: string;
  maxAdditionalInformation: number;

  constructor() { }

  static fromSqlResult(fields: any): ScheduledQuery {
    let squery = new ScheduledQuery();
    Object.assign(squery, fields);

    if (!squery.dayOfWeek) {
      squery.dayOfWeek = [1, 2, 3, 4, 5]; //Mon - Fri
    }

    if (squery.scheduleType === ScheduledQuery.REPEAT) {
      // set some defaults
      squery.start = new ScheduledTime();
      squery.end = new ScheduledTime(23, 59, 59);
    }

    if (fields.hasOwnProperty('startHour') &&
      fields.hasOwnProperty('startMinute') &&
      fields.hasOwnProperty('startSecond')) {
      squery.start = new ScheduledTime(fields.startHour, fields.startMinute, fields.startSecond);
    }

    if (fields.scheduleType === ScheduledQuery.REPEAT &&
      fields.hasOwnProperty('endHour') &&
      fields.hasOwnProperty('endMinute') &&
      fields.hasOwnProperty('endSecond')) {
      squery.end = new ScheduledTime(fields.endHour, fields.endMinute, fields.endSecond);
    }

    return squery;
  }

  static fromSqlResults(result: any[]): ScheduledQuery[] {
    let squerys: ScheduledQuery[] = [];
    for (let item of result) {
      squerys.push(ScheduledQuery.fromSqlResult(item));
    }
    return squerys;
  }

  getRecurrenceRules(): RecurrenceSpec[] {
    if (this.scheduleType === ScheduledQuery.ONCE) {
      return [{
        dayOfWeek: this.dayOfWeek,
        hour: this.start.hour,
        minute: this.start.minute,
        second: this.start.second
      }];
    }

    if (this.scheduleType === ScheduledQuery.REPEAT) {
      let rules: RecurrenceSpec[] = [];

      if (this.end.totalMinutes() <= this.start.totalMinutes()) {
        // schedule is invalid
        return rules;
      }

      // The frequency is an odd period, just add minutes
      // and create a rule at each point until we hit the end time.
      if ((60 - this.start.minute) % this.frequency !== 0) {
        let currentMinutes = this.start.totalMinutes(),
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

      let startHour: number = this.start.hour;
      let endHour: number = this.end.hour;
      if (this.start.minute > 0) {
        rules.push({
          dayOfWeek: this.dayOfWeek,
          hour: startHour,
          minute: new Range(this.start.minute, 59, this.frequency)
        });
        startHour += 1;
      }

      if (this.end.minute > 0) {
        rules.push({
          dayOfWeek: this.dayOfWeek,
          hour: endHour,
          minute: new Range(0, this.end.minute, this.frequency)
        });
        endHour -= 1;
      }

      if (startHour <= endHour) {
        rules.push({
          dayOfWeek: this.dayOfWeek,
          hour: new Range(startHour, endHour),
          minute: new Range(0, 59, this.frequency)
        });
      }

      return rules;
    }

    return null;
  }
}