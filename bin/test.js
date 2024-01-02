// const $layers = {
//   async emotion({ context }) {},
// };

// let $worker = {
//   async onSynchronize() {},
// };

const $export = {
  /**
   * @type {import('./types').$export.onBoot}
   * @returns {Promise<void>}
   */
  async onBoot() {
    network_request_json("http://vk.com")
  },

  /**
   * @type {import('./types').$export.onMessage}
   * @param dialogId
   * @param context
   * @returns {Promise<*>}
   */
  async onMessage({ dialogId, context }) {
    const openAi = new OpenAI(
      "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",
    );

    if (context[0][0].gifDescription) {
      const answerText = openAi.make({
        text:
          "Write a request in GIFLY for find GIF to respond to a GIF sent by a user with the following content, no more than 5 words: " +
          context[0][0].gifDescription,
      })?.choices[0].message.content;

      return answer.plainText({
        dialogId,
        text: answerText,
      });
    }

    const text = context[0][0].plainText;

    const answerText = openAi.make({ text: text })?.choices[0].message.content;

    // const oai = new OpenAI()
    //
    // const answer = await oai.take("как дела")
    //
    // console.log(JSON.stringify(answer))
    //
    answer.plainText({
      dialogId,
      text: answerText,
    });
  },
};
