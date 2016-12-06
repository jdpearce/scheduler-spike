import 'jasmine';
import { ScheduledQuery } from '../model/scheduledquery';
import { ScheduledTime } from '../model/scheduledtime';
import { Range, RecurrenceSpec } from 'node-schedule';

describe("ScheduledQuery and helper functions :", function () {

  it("should construct once a day scheduled query from sql result object", function () {
    let sqlResult: any = {
      serviceName: "Daily Test Service",
      scheduleType: ScheduledQuery.ONCE,
      startHour: 6,
      startMinute: 0,
      startSecond: 0
    };

    let sq = ScheduledQuery.fromSqlResult(sqlResult);

    expect(sq.serviceName).toEqual(sqlResult.serviceName);
    expect(sq.dayOfWeek).toEqual([1, 2, 3, 4, 5]);
    expect(sq.scheduleType).toBe(ScheduledQuery.ONCE);
    expect(sq.end).toBeUndefined();
    expect(sq.frequency).toBeUndefined();
    expect(sq.start).not.toBeUndefined();
    expect(sq.start.hour).toBe(sqlResult.startHour);
    expect(sq.start.minute).toBe(sqlResult.startMinute);
    expect(sq.start.second).toBe(sqlResult.startSecond);
  });

  it("should construct repeating scheduled query from sql result object without end time", function () {
    let sqlResult: any = {
      serviceName: "Intraday Repeating Test Service",
      scheduleType: ScheduledQuery.REPEAT,
      startHour: 6,
      startMinute: 0,
      startSecond: 0,
      frequency: 15
    };

    let sq = ScheduledQuery.fromSqlResult(sqlResult);

    expect(sq.serviceName).toEqual(sqlResult.serviceName);
    expect(sq.dayOfWeek).toEqual([1, 2, 3, 4, 5]);
    expect(sq.scheduleType).toBe(ScheduledQuery.REPEAT);

    expect(sq.start).not.toBeUndefined();
    expect(sq.start.hour).toBe(sqlResult.startHour);
    expect(sq.start.minute).toBe(sqlResult.startMinute);
    expect(sq.start.second).toBe(sqlResult.startSecond);

    expect(sq.frequency).toBe(sqlResult.frequency);

    expect(sq.end).not.toBeUndefined();
    expect(sq.end.hour).toBe(23);
    expect(sq.end.minute).toBe(59);
    expect(sq.end.second).toBe(59);
  });

  it("call to getRecurrenceRules should not fail if end is before start", function () {
    let sqlResult: any = {
      serviceName: "Erroneous Impossible Service - 6.30am to 5.00am, every 15 minutes.",
      scheduleType: ScheduledQuery.REPEAT,
      startHour: 6,
      startMinute: 30,
      startSecond: 0,
      frequency: 15,
      endHour: 5,
      endMinute: 0,
      endSecond: 0
    };

    // This service should start at 6am, then run every 15 minutes until midnight.

    let sq = ScheduledQuery.fromSqlResult(sqlResult);
    let rules: RecurrenceSpec[];
    expect(() => { rules = sq.getRecurrenceRules(); }).not.toThrow();
    expect(rules).not.toBeUndefined();
    expect(rules.length).toBe(0);
  });

  it("should construct recurrence rule list from REPEAT with divisor frequency", function () {
    let sqlResult: any = {
      serviceName: "Intraday Repeating Test Service - 6.30am 7.00am, every 15 minutes.",
      scheduleType: ScheduledQuery.REPEAT,
      startHour: 6,
      startMinute: 30,
      startSecond: 0,
      frequency: 15,
      endHour: 8,
      endMinute: 30,
      endSecond: 0
    };

    let sq = ScheduledQuery.fromSqlResult(sqlResult);
    let rules = sq.getRecurrenceRules();
    
    expect(rules).not.toBeUndefined();
    expect(rules.length).toBe(3);
    
    expect(rules[0].hour).toEqual(6);
    expect(rules[0].minute).toEqual(new Range(30, 59, 15));

    expect(rules[2].hour).toEqual(new Range(7, 7));
    expect(rules[2].minute).toEqual(new Range(0, 59, 15));

    expect(rules[1].hour).toEqual(8);
    expect(rules[1].minute).toEqual(new Range(0, 30, 15));
  });


  it("should construct recurrence rule list from REPEAT with divisor frequency and no mid-hours", function () {
    let sqlResult: any = {
      serviceName: "Intraday Repeating Test Service - 6.30am 7.30am, every 15 minutes.",
      scheduleType: ScheduledQuery.REPEAT,
      startHour: 6,
      startMinute: 30,
      startSecond: 0,
      frequency: 15,
      endHour: 7,
      endMinute: 30,
      endSecond: 0
    };

    let sq = ScheduledQuery.fromSqlResult(sqlResult);
    let rules = sq.getRecurrenceRules();
    
    expect(rules).not.toBeUndefined();
    expect(rules.length).toBe(2);
    
    expect(rules[0].hour).toEqual(6);
    expect(rules[0].minute).toEqual(new Range(30, 59, 15));

    expect(rules[1].hour).toEqual(7);
    expect(rules[1].minute).toEqual(new Range(0, 30, 15));
  });  

  it("should construct recurrence rule list from REPEAT with non-divisor frequency", function () {
    let sqlResult: any = {
      serviceName: "Intraday Repeating Test Service - 6.30am 7.00am, every 15 minutes.",
      scheduleType: ScheduledQuery.REPEAT,
      startHour: 6,
      startMinute: 30,
      startSecond: 0,
      frequency: 37,
      endHour: 8,
      endMinute: 0,
      endSecond: 0
    };

    let sq = ScheduledQuery.fromSqlResult(sqlResult);
    let rules = sq.getRecurrenceRules();
    
    expect(rules).not.toBeUndefined();
    expect(rules.length).toBe(3);
    
    expect(rules[0].hour).toEqual(6);
    expect(rules[0].minute).toEqual(30);

    expect(rules[1].hour).toEqual(7);
    expect(rules[1].minute).toEqual(7);

    expect(rules[2].hour).toEqual(7);
    expect(rules[2].minute).toEqual(44);
  });

  it("should construct single daily recurrence spec from ONCE", function () {
    let sqlResult: any = {
      serviceName: "Once A Day Test Service - 6.30am.",
      scheduleType: ScheduledQuery.ONCE,
      startHour: 6,
      startMinute: 30,
      startSecond: 0,
    };

    // This service should start at 6am, then run every 15 minutes until midnight.

    let sq = ScheduledQuery.fromSqlResult(sqlResult);
    let rules = sq.getRecurrenceRules();
    
    expect(rules).not.toBeUndefined();
    expect(rules.length).toBe(1);
    expect(rules[0].hour).toEqual(6);
    expect(rules[0].minute).toEqual(30);
  });

  it("should not run out of heap memory!", function () {
    let sqlResult: any = {
      serviceName: "Intraday Repeating Test Service - 7.00am, every 720 minutes (12 hours).",
      scheduleType: ScheduledQuery.REPEAT,
      startHour: 7,
      startMinute: 0,
      startSecond: 0,
      frequency: 720,
    };

    let sq = ScheduledQuery.fromSqlResult(sqlResult);
    expect(() => { let rules = sq.getRecurrenceRules(); }).not.toThrow();
  });  
});