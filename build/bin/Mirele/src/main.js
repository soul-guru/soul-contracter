"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schedule_1 = require("./schedule");
const worker_1 = require("./worker");
const use_1 = require("./use");
const Job_1 = require("./SoulKit/Job");
const $export = {
    $schedule: schedule_1.$schedule,
    $worker: worker_1.$worker,
    async onBoot() {
        Job_1.Job.create("* * * * *", function () {
        });
    },
    async onMessage({ context, dialogId }) {
        await use_1.$use.openDialog.call({ context, dialogId });
    }
};
//# sourceMappingURL=main.js.map