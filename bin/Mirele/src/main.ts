import {$schedule} from "./schedule";
import {$worker} from "./worker";

import {$use} from "./use";
import {Job} from "./SoulKit/Job";

const $export: SoulExports = {
  $schedule,
  $worker,

  async onBoot() {
    // stdout(JSON.stringify(globalThis))
    Job.create("* * * * *", function () {

    })
  },

  async onMessage({context, dialogId}) {
    await $use.openDialog.call({context, dialogId})
  }
}

