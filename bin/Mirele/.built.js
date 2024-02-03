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

class StringUtil {
    static makeid(length = 8) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }
    static getUrls(str, lower = false) {
        const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi;
        const bracketsRegexp = /[()]/g;
        if (typeof str !== "string") {
            throw new TypeError(`The str argument should be a string, got ${typeof str}`);
        }
        if (str) {
            let urls = str.match(regexp);
            if (urls) {
                return lower ? urls.map((item) => item.toLowerCase().replace(bracketsRegexp, "")) : urls.map((item) => item.replace(bracketsRegexp, ""));
            }
            else {
                return undefined;
            }
        }
        else {
            return undefined;
        }
    }
    static makeRandomAlphanumericString(length = 8) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    static truncateWithEllipsis(text, maxLength) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength - 3) + '...';
        }
        return text;
    }
    static capitalizeFirstLetter(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    static reverseString(text) {
        return text.split('').reverse().join('');
    }
    static countSubstringOccurrences(text, search) {
        const regex = new RegExp(search, 'g');
        const matches = text.match(regex);
        return matches ? matches.length : 0;
    }
    static startsWith(text, prefix) {
        return text.startsWith(prefix);
    }
    static endsWith(text, suffix) {
        return text.endsWith(suffix);
    }
    static removeWhitespace(text) {
        return text.replace(/\s+/g, '');
    }
    static toLowerCase(text) {
        return text.toLowerCase();
    }
    static toUpperCase(text) {
        return text.toUpperCase();
    }
    static isEmpty(text) {
        return text.trim() === '';
    }
    static isNumeric(text) {
        return /^\d+$/.test(text);
    }
    static splitString(text, delimiter) {
        return text.split(delimiter);
    }
    static joinStrings(array, separator) {
        return array.join(separator);
    }
    static removeSubstring(text, substring) {
        return text.split(substring).join('');
    }
    static toTitleCase(text) {
        return text
            .split(' ')
            .map(word => StringUtil.capitalizeFirstLetter(word))
            .join(' ');
    }
    static isPalindrome(text) {
        const cleanText = text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const reversedText = StringUtil.reverseString(cleanText);
        return cleanText === reversedText;
    }
    static trimWhitespace(text) {
        return text.trim();
    }
    static replaceAll(text, oldSubstring, newSubstring) {
        return text.split(oldSubstring).join(newSubstring);
    }
    static isAlphabetic(text) {
        return /^[a-zA-Z]+$/.test(text);
    }
    static containsSubstring(text, substring) {
        return text.includes(substring);
    }
    static escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    static isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailRegex.test(email);
    }
    static removeNonAlphanumeric(text) {
        return text.replace(/[^a-zA-Z0-9]/g, '');
    }
    static toSnakeCase(text) {
        return text
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .toLowerCase();
    }
    static toCamelCase(text) {
        return text
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, character) => character.toUpperCase())
            .replace(/[^a-zA-Z0-9]/g, '');
    }
    static repeatString(text, count) {
        return text.repeat(count);
    }
    static containsOnlyWhitespace(text) {
        return /^\s+$/.test(text);
    }
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static countWords(text) {
        const words = text.split(/\s+/);
        return words.length;
    }
    static isAlphabeticWithSpaces(text) {
        return /^[a-zA-Z\s]+$/.test(text);
    }
    static removeDiacritics(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    static isValidIPv4(ipAddress) {
        const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Regex.test(ipAddress);
    }
}

class Job {
}
Job.create = (time, func) => {
    const id = StringUtil.makeid(12);
    if (typeof $export['$schedule'] == "undefined") {
        $export['$schedule'] = {};
    }
    $export['$schedule'][id] = func;
    $foundation.$schedule.create(time, id);
};

const $export$1 = {
    $schedule,
    $worker,
    async onBoot() {
        Job.create("* * * * *", function () {
        });
    },
    async onMessage({ context, dialogId }) {
        await $use.openDialog.call({ context, dialogId });
    }
};
