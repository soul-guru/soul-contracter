"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const StringUtil_1 = require("./StringUtil");
class Job {
    static create = (time, func) => {
        const id = StringUtil_1.StringUtil.makeid(12);
        if (typeof $export['$schedule'] == "undefined") {
            $export['$schedule'] = {};
        }
        $export['$schedule'][id] = func;
        $foundation.$schedule.create(time, id);
    };
}
exports.Job = Job;
//# sourceMappingURL=Job.js.map