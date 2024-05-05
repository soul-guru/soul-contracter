import {StringUtil} from "./StringUtil";


/**
 * Represents a Job class for creating and scheduling jobs.
 */
export class Job {
  /**
   * Creates and schedules a job to run at a specific time.
   * @param time - The time in Cron format when the job should run.
   * @param func - The function to be executed as the job.
   */
  static create = (time: string, func: () => void) => {
    const id = StringUtil.makeid(12);

    //@ts-ignore
    if (typeof $export['$schedule'] == "undefined") {
      //@ts-ignore
      $export['$schedule'] = {}
    }

    //@ts-ignore
    $export['$schedule'][id] = func;

    $foundation.$schedule.create(time, id);
  }
}
