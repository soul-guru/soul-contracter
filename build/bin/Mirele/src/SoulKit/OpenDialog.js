"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
class OpenDialog {
    prompt;
    token;
    _store;
    constructor(prompt, token) {
        this.prompt = prompt;
        this.token = token;
    }
    requestStore(dialogId) {
        return (0, index_1.$store)(dialogId, {
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
        const answer = await (0, index_1.$kit)(this.token)
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
exports.default = OpenDialog;
//# sourceMappingURL=OpenDialog.js.map