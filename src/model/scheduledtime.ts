export class ScheduledTime {
  constructor(
    public readonly hour: number = 0,
    public readonly minute: number = 0,
    public readonly second: number = 0) {
    if (this.second >= 60) {
      this.minute += Math.floor(this.second / 60);
      this.second = this.second % 60;
    }

    if (this.minute >= 60) {
      this.hour += Math.floor(this.minute / 60);
      this.minute = this.minute % 60;
    }

    this.hour = this.hour % 24;
  }

  totalMinutes(): number {
    return this.minute + this.hour*60;
  }

  addMinutes(minutes: number): ScheduledTime {
    return new ScheduledTime(this.hour, this.minute + minutes, this.second);
  }

  copy(): ScheduledTime {
    return new ScheduledTime(this.hour, this.minute, this.second);
  }

  static EOD: ScheduledTime = new ScheduledTime(23, 59, 59);
}

