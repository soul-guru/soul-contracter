/**
 * Represents a JobTimeBuilder class for defining Cron job schedules with basic time units.
 */
export class JobTimeBuilder {
  /**
   * The Cron expression representing the schedule.
   */
  private cronExpression: string;

  /**
   * Creates a new instance of the JobTimeBuilder class.
   * @param cronExpression - The initial Cron expression.
   */
  constructor(cronExpression: string = '* * * * * *') {
    this.cronExpression = cronExpression;
  }

  /**
   * Creates a JobTimeBuilder for running the job every N seconds.
   * @param seconds - The number of seconds (1 to 59) between job executions.
   * @returns A new JobTimeBuilder instance.
   */
  public everySeconds(seconds: number): JobTimeBuilder {
    this.cronExpression = `*/${seconds} * * * * *`;
    return this;
  }

  /**
   * Creates a JobTimeBuilder for running the job every N minutes.
   * @param minutes - The number of minutes (1 to 59) between job executions.
   * @returns A new JobTimeBuilder instance.
   */
  public everyMinutes(minutes: number): JobTimeBuilder {
    this.cronExpression = `0 */${minutes} * * * *`;
    return this;
  }

  /**
   * Creates a JobTimeBuilder for running the job every N hours.
   * @param hours - The number of hours (1 to 23) between job executions.
   * @returns A new JobTimeBuilder instance.
   */
  public everyHours(hours: number): JobTimeBuilder {
    this.cronExpression = `0 0 */${hours} * * *`;
    return this;
  }

  /**
   * Creates a JobTimeBuilder for running the job every day at a specific hour and minute.
   * @param hour - The hour of the day (0 to 23) when the job should run.
   * @param minute - The minute of the hour (0 to 59) when the job should run.
   * @returns A new JobTimeBuilder instance.
   */
  public dailyAt(hour: number, minute: number): JobTimeBuilder {
    this.cronExpression = `0 ${minute} ${hour} * * *`;
    return this;
  }

  /**
   * Gets the Cron expression for the schedule.
   * @returns The Cron expression.
   */
  public getCronExpression(): string {
    return this.cronExpression;
  }
}
