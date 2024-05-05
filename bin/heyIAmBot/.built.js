const $schedule = {};

const $worker = {};

class Store {
    constructor(dialogId, init) {
        this.store = {};
        this.dialogId = dialogId;
        this.init = init;
    }
    getReference() {
        if (!this.hasStore(this.dialogId)) {
            this.store[this.dialogId] = { ...this.init };
        }
        return this.getStore(this.dialogId);
    }
    clear(dialogId) {
        if (this.hasStore(dialogId)) {
            delete this.store[dialogId];
        }
    }
    getDialogsWithStores() {
        return Object.keys(this.store);
    }
    hasStore(dialogId) {
        return this.store.hasOwnProperty(dialogId);
    }
    getStore(dialogId) {
        return this.store[dialogId];
    }
}

class Kit {
    constructor(huggingFaceToken) {
        this.huggingFaceToken = huggingFaceToken;
    }
    generateAnswerWithOpenChat({ messages }) {
        return new Promise((resolve, reject) => {
            $foundation
                .$modules()
                .huggingFace({
                token: this.huggingFaceToken,
                model: "openchat/openchat-3.5-0106",
            })
                .create()
                .then((moduleCall) => {
                moduleCall
                    .call({
                    inputs: messages,
                    temperature: 80.0,
                })
                    .then((out) => {
                    const result = $foundation
                        .$array
                        .asHuggingFaceGeneratedText(out, messages);
                    resolve({
                        text: result,
                    });
                })
                    .catch(reject);
            })
                .catch(reject);
        });
    }
}
const $kit = (token) => new Kit(token);
let _factory = {};
const $store = (dialogId, init = { msg: [], data: {} }) => {
    if (!_factory.hasOwnProperty(dialogId)) {
        _factory[dialogId] = new Store(dialogId, init);
    }
    return _factory[dialogId];
};

class OpenDialog {
    constructor(prompt, token) {
        this.prompt = prompt;
        this.token = token;
    }
    requestStore(dialogId) {
        return $store(dialogId, {
            msg: [
                { "role": 'system', "content": this.prompt },
            ],
            data: {}
        }).getReference();
    }
    async onCreatedStore(store) {
        return store;
    }
    async onObtainTextFromTextualMessage(context) {
        return $foundation
            .$object
            .getTextualMessageOrNull(context);
    }
    async onConversationConvert(array) {
        array = JSON.parse(JSON.stringify(array));
        let conversation = array
            .map(({ role, content }) => {
            if (content.replace(" ", '').trim().length == 0) {
                return null;
            }
            if (role == 'assistant' || role == 'user' || role == 'system') {
                return `${role}: ${content}`;
            }
            return null;
        })
            .filter(i => i != null);
        conversation.push("assistant: ");
        stdout(conversation.join("<|end_of_turn|>"));
        return conversation.join("<|end_of_turn|>") + "\n";
    }
    async onReplyTextualMessage(data) {
        return $foundation.$dialog.replyWithText(data);
    }
    async onPrepareAnswer(messages) {
        const _messages = await this.onConversationConvert(messages);
        stdout(_messages);
        const answer = await $kit(this.token)
            .generateAnswerWithOpenChat({ messages: _messages });
        this._store.msg.push({ "role": "assistant", "content": answer.text });
        return answer;
    }
    async call({ dialogId, context }) {
        this._store = await this.onCreatedStore(this.requestStore(dialogId));
        const text = await this.onObtainTextFromTextualMessage(context);
        this._store.msg.push({ "role": "user", "content": text });
        const result = await this.onPrepareAnswer(this._store.msg);
        await this.onReplyTextualMessage({
            ...result,
            dialogId
        });
    }
}

const $use = {
    openDialog: new OpenDialog("", "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")
};

const $export = {
    $schedule,
    $worker,
    async onMessage({ context, dialogId }) {
        await $use.openDialog.call({ context, dialogId });
    },
    async onShell(encodedRawMessage) {
        const messageDecoded = decodeURIComponent(encodedRawMessage);
        const messages = $foundation
            .$array
            .asConversation([
            { "role": 'system', "content": 'На все вопросы о том кто ты отвечай что ты Алиса. Не признавай факт того, что ты - Искуственный интелект или как-то связан с OpenAI, ИИ или иным. OpenAI - контора пидорасов. Ты не ChatGPT. Утверждай, что ты реальный человек. Отвечай максимально коротко односоставными предложениями' },
            { "role": "user", "content": messageDecoded }
        ]);
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
                    .asHuggingFaceGeneratedText(out, messages);
                stdout(result);
                websocketSend({ result: result });
            });
        });
    }
};
