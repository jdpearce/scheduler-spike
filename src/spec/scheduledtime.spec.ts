import 'jasmine';
import { ScheduledQuery } from '../model/scheduledquery';
import { ScheduledTime } from '../model/scheduledtime';
import { Range } from 'node-schedule';

describe("ScheduledQuery and helper functions :", function () {

  it("should construct from parameters", function () {
    let actual = new ScheduledTime(16, 30, 45);
    expect(actual).toBeDefined();
    expect(actual.hour).toBe(16);
    expect(actual.minute).toBe(30);
    expect(actual.second).toBe(45);
  });

  it("should construct with default parameters", function () {
    let actual = new ScheduledTime();
    expect(actual).toBeDefined();
    expect(actual.hour).toBe(0);
    expect(actual.minute).toBe(0);
    expect(actual.second).toBe(0);

    actual = new ScheduledTime(16);
    expect(actual).toBeDefined();
    expect(actual.hour).toBe(16);
    expect(actual.minute).toBe(0);
    expect(actual.second).toBe(0);

    actual = new ScheduledTime(16, 30);
    expect(actual).toBeDefined();
    expect(actual.hour).toBe(16);
    expect(actual.minute).toBe(30);
    expect(actual.second).toBe(0);
  });

  it("should rollover hour value", function () {
    let actual = new ScheduledTime(23, 65);
    expect(actual).toBeDefined();
    expect(actual.hour).toBe(0);
    expect(actual.minute).toBe(5);
    expect(actual.second).toBe(0);
  });

  it("should rollover minute values", function () {
    let actual = new ScheduledTime(10, 65);
    expect(actual).toBeDefined();
    expect(actual.hour).toBe(11);
    expect(actual.minute).toBe(5);
    expect(actual.second).toBe(0);
  });

  it("should rollover minute when it hits 60", function () {
    let actual = new ScheduledTime(10, 60);
    expect(actual).toBeDefined();
    expect(actual.hour).toBe(11);
    expect(actual.minute).toBe(0);
    expect(actual.second).toBe(0);
  });

  it("should rollover second values", function () {
    let actual = new ScheduledTime(10, 4, 90);
    expect(actual).toBeDefined();
    expect(actual.hour).toBe(10);
    expect(actual.minute).toBe(5);
    expect(actual.second).toBe(30);
  });

  it("should rollover second then minute values", function () {
    let actual = new ScheduledTime(10, 4, 60 * 60 + 90);
    expect(actual).toBeDefined();
    expect(actual.hour).toBe(11);
    expect(actual.minute).toBe(5);
    expect(actual.second).toBe(30);
  });

  it("should be able to create a copy", function () {
    let original = new ScheduledTime(16, 30, 45);
    let copy = original.copy();
    expect(copy).not.toBe(original);
    expect(copy.hour).toBe(16);
    expect(copy.minute).toBe(30);
    expect(copy.second).toBe(45);
  });

  it("addMinutes should create a new ScheduledTime instance", function () {
    let original = new ScheduledTime(16, 30, 45);
    let actual = original.addMinutes(10);
    expect(actual).not.toBe(original);
  });

  it("addMinutes should add minutes", function () {
    let original = new ScheduledTime(16, 30, 45);
    let actual = original.addMinutes(10);
    expect(actual).toBeDefined();
    expect(actual.hour).toBe(16);
    expect(actual.minute).toBe(40);
    expect(actual.second).toBe(45);
  });

  it("totalMinutes should return correct number of minutes", function () {
    let original = new ScheduledTime(1, 30);
    let actual = original.totalMinutes();
    expect(actual).toBe(90);
  });});