const $foundation = {
    $system: {
        contextFunctions: Object.getOwnPropertyNames(this),
    },
    $string: {
        getUrls(str, lower = false) {
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
        },
    },
    $dialog: {
        replyWithText(dialogId, text) {
            if (!text || !dialogId) {
                return null;
            }
            (answer || null)?.plainText({
                dialogId,
                text: text.trim(),
            });
            return null;
        },
        getTextualMessageOrNull(context) {
            if (!context || !context[0] || !context[0].plainText) {
                return null;
            }
            return context[0].plainText || null;
        },
    },
};
//# sourceMappingURL=Foundation.js.map