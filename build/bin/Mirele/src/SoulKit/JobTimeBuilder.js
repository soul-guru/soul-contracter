"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobTimeBuilder = void 0;
class JobTimeBuilder {
    cronExpression;
    constructor(cronExpression = '* * * * * *') {
        this.cronExpression = cronExpression;
    }
    everySeconds(seconds) {
        this.cronExpression = `*/${seconds} * * * * *`;
        return this;
    }
    everyMinutes(minutes) {
        this.cronExpression = `0 */${minutes} * * * *`;
        return this;
    }
    everyHours(hours) {
        this.cronExpression = `0 0 */${hours} * * *`;
        return this;
    }
    dailyAt(hour, minute) {
        this.cronExpression = `0 ${minute} ${hour} * * *`;
        return this;
    }
    getCronExpression() {
        return this.cronExpression;
    }
}
exports.JobTimeBuilder = JobTimeBuilder;
//# sourceMappingURL=JobTimeBuilder.js.map