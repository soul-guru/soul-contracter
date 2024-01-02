/**
 *
 * @type {{onBoot(): Promise<*>, onMessage({dialogId: *, context: *}): Promise<*>}}
 */
const $export = {
  async onBoot() {},
  async onMessage({ dialogId, context }) {},
};

module.exports = { $export };
