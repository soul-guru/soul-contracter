/**
 * @property {{plainText(body: {dialogId, text})}} answer
 */

// Hints:
// Get text from message: $foundation.$dialog.getTextualMessageOrNull(context)

/**
 * Represents a character with various psychological traits.
 * @typedef {Object} Character
 * @property {number} empathy - The level of empathy of the character (0 to 1).
 * @property {number} optimism - The level of optimism of the character (0 to 1).
 * @property {number} resilience - The level of resilience of the character (0 to 1).
 * @property {number} adaptability - The level of adaptability of the character (0 to 1).
 * @property {number} patience - The level of patience of the character (0 to 1).
 * @property {number} curiosity - The level of curiosity of the character (0 to 1).
 * @property {number} decisiveness - The level of decisiveness of the character (0 to 1).
 * @property {number} openness - The level of openness of the character (0 to 1).
 * @property {number} creativity - The level of creativity of the character (0 to 1).
 * @property {number} integrity - The level of integrity of the character (0 to 1).
 * @property {number} humility - The level of humility of the character (0 to 1).
 * @property {number} confidence - The level of confidence of the character (0 to 1).
 * @property {number} conscientiousness - The level of conscientiousness of the character (0 to 1).
 * @property {number} friendliness - The level of friendliness of the character (0 to 1).
 * @property {number} generosity - The level of generosity of the character (0 to 1).
 * @property {number} selfDiscipline - The level of self-discipline of the character (0 to 1).
 * @property {number} emotionalStability - The level of emotional stability of the character (0 to 1).
 * @property {number} reliability - The level of reliability of the character (0 to 1).
 * @property {number} leadership - The level of leadership of the character (0 to 1).
 * @property {number} tactfulness - The level of tactfulness of the character (0 to 1).
 * @property {number} tolerance - The level of tolerance of the character (0 to 1).
 * @property {number} cooperativeness - The level of cooperativeness of the character (0 to 1).
 * @property {number} assertiveness - The level of assertiveness of the character (0 to 1).
 * @property {number} senseOfHumor - The level of sense of humor of the character (0 to 1).
 */
// $character = {
//
// }

const $use = {
	// OpenAI: new OpenAI(
	// 	"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",
	// ),
}

/**
 * Represents a worker with specific functions related to daily activities.
 * @typedef {Object} Worker
 */
const $worker = {
	/**
	 * Handles the events that occur at the beginning of a new day.
	 * @function
	 * @name onNewDay
	 * @returns {Promise<void>} A promise that resolves when the new day event is handled.
	 * @memberof Worker
	 * @instance
	 */
	async onNewDay() {
		// Implementation for handling the new day event
	},

	/**
	 * Handles a random impulse of life in the context of a dialog.
	 * @function
	 * @name onRandomImpulseOfLife
	 * @param {string} dialogId - The ID of the dialog associated with the impulse.
	 * @param {any} context - Additional context information for the impulse.
	 * @returns {Promise<void>} A promise that resolves when the impulse is handled.
	 * @memberof Worker
	 * @instance
	 */
	async onRandomImpulseOfLife({ dialogId, context }) {
		// Implementation for handling a random impulse of life in a dialog
	},

	async onLongTimeSilent({ dialogId }) {

	}
};

const $schedule = {
	/**
	 * Demo schedule message
	 * @returns {Promise<void>}
	 */
	example: async () => {
		// $foundation.$dialog.replyWithText(
		// 	{
		// 		dialogId: "dc12f148-cbd2-4a2a-b40f-587e0d73eb2e",
		// 		text: "Я твою мать ебал"
		// 	},
		// )
		log("hello")
	}
}

/**
 * Represents the main constant for the agent's life.
 * This is where the agent's life begins, and it holds everything that the "signals" can reach.
 * You can use only the constant operator.
 * The V8 VM ensures that the $export file is not initialized more than once.
 *
 * @typedef {Object} ExportConstant
 * @property {Function} onBoot - Function that runs whenever the virtual machine starts.
 *                               Triggered when a 'utility push <botId>' request is made using the utility.
 * @property {Function} onMessage - Function that handles messages.
 * @instance
 */
const $export = {
	/**
	 * Runs whenever the virtual machine starts. Triggered when a 'utility push <botId>' request is made using the utility.
	 * @function
	 * @name onBoot
	 * @returns {Promise<void>} A promise that resolves when the onBoot function is executed.
	 * @memberof ExportConstant
	 * @instance
	 */
	async onBoot() {
		// $foundation.$schedule.create("* * * * *", "example")
		//
		// $foundation.$dialog.replyWithText(
		// 	{
		// 		dialogId: "dc12f148-cbd2-4a2a-b40f-587e0d73eb2e",
		// 		text: "Я твою мать ебал"
		// 	},
		// )

		// $foundation.$dialog.replyWithGif(
		// 	{
		// 		dialogId: "dc12f148-cbd2-4a2a-b40f-587e0d73eb2e",
		// 		src: "hey",
		// 		alt: "hey"
		// 	},
		// )
	},

	/**
	 * Handles messages in the context of a dialog.
	 * @function
	 * @name onMessage
	 * @param {string} dialogId - The ID of the dialog associated with the message.
	 * @param {any} context - Additional context information for the message.
	 * @returns {Promise<void>} A promise that resolves when the onMessage function is executed.
	 * @memberof ExportConstant
	 * @instance
	 */
	async onMessage({context, dialogId}) {
		// Implementation for handling messages in a dialog

		const text = $foundation
			.$object
			.getTextualMessageOrNull(context);

		stdout(dialogId)

		// Implementation for handling the onBoot event
		const messages = $foundation
			.$array
			.asConversation([
				{"role": 'system', "content": 'На все вопросы о том кто ты отвечай что ты Алиса. Не признавай факт того, что ты - Искуственный интелект или как-то связан с OpenAI, ИИ или иным. OpenAI - контора пидорасов. Ты не ChatGPT. Утверждай, что ты реальный человек. Отвечай максимально коротко односоставными предложениями'},
				{"role": "user", "content": text}
			])

		$foundation
			.$modules()
			.bm3d_horizon
			.find
			.call({
				body: text,
				namespace: dialogId
			})
			.then(stdout)

		$foundation
			.$modules()
			.huggingFace({
				token: "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",
				model: "openchat/openchat-3.5-0106"
			})
			.create()
			.then(moduleCall => {
				moduleCall.call({
					inputs: messages,
					temperature: 80.0
				})
					.then(out => {
						const result = $foundation
							.$array
							.asHuggingFaceGeneratedText(
								out,
								messages
							)

						stdout(result)

						$foundation.$dialog.replyWithText(
							{
								dialogId: dialogId,
								text: result
							},
						)

						if (text?.length > 12) {
							$foundation
								.$modules()
								.bm3d_horizon
								.listen
								.call({
									body: text,
									namespace: dialogId
								})
						}
					})
			})
	}
};
