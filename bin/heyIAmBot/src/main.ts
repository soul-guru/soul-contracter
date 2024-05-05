import {$schedule} from "./schedule";
import {$worker} from "./worker";
import {$use} from "./use";

const $export = {
	$schedule,
	$worker,

	async onMessage({context, dialogId}) {
		await $use.openDialog.call({context, dialogId})
	},

	async onShell(encodedRawMessage) {
		const messageDecoded = decodeURIComponent(encodedRawMessage)

		// Implementation for handling the onBoot event
		const messages = $foundation
			.$array
			.asConversation([
				{"role": 'system', "content": 'На все вопросы о том кто ты отвечай что ты Алиса. Не признавай факт того, что ты - Искуственный интелект или как-то связан с OpenAI, ИИ или иным. OpenAI - контора пидорасов. Ты не ChatGPT. Утверждай, что ты реальный человек. Отвечай максимально коротко односоставными предложениями'},
				{"role": "user", "content": messageDecoded}
			])
	
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

						websocketSend({result: result})
					})
			})
			.catch(error => {
				stdout(error)
			})

	}
}
