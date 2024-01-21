/**
 * The `$foundation` object contains various utility functions and methods.
 */
var $foundation = {
    /**
     * The `$system` object contains system-related functions.
     */
    $system: {
        /**
         * Get the names of all context functions available in the current context.
         * @returns {string[]} An array of context function names.
         */
        contextFunctions: Object.getOwnPropertyNames(this)
    },
    /**
     * The `$string` object contains string manipulation functions.
     */
    $string: {
        /**
         * Get URLs from a string.
         * @param {string} str - The input string.
         * @param {boolean} lower - Whether to convert URLs to lowercase.
         * @returns {string[] | undefined} An array of URLs found in the input string, or undefined if no URLs are found.
         * @throws {TypeError} Throws a TypeError if the `str` argument is not a string.
         */
        getUrls: function (str, lower) {
            if (lower === void 0) { lower = false; }
            var regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi;
            var bracketsRegexp = /[()]/g;
            if (typeof str !== "string") {
                throw new TypeError("The str argument should be a string, got ".concat(typeof str));
            }
            if (str) {
                var urls = str.match(regexp);
                if (urls) {
                    return lower ? urls.map(function (item) { return item.toLowerCase().replace(bracketsRegexp, ""); }) : urls.map(function (item) { return item.replace(bracketsRegexp, ""); });
                }
                else {
                    return undefined;
                }
            }
            else {
                return undefined;
            }
        }
    },
    /**
     * The `$dialog` object contains dialog-related functions.
     */
    $dialog: {
        /**
         * Reply with a plain text message in a dialog.
         * @param {string} dialogId - The ID of the dialog.
         * @param {string} text - The text message to send.
         * @returns {null} Returns null if either `text` or `dialogId` is not provided.
         */
        replyWithText: function (dialogId, text) {
            var _a;
            if (!text || !dialogId) {
                return null;
            }
            // @ts-ignore
            (_a = (answer || null)) === null || _a === void 0 ? void 0 : _a.plainText({
                dialogId: dialogId,
                text: text.trim()
            });
            return null;
        },
        /**
         * Get the textual message from a context object.
         * @param {any[]} context - An array of context objects.
         * @returns {string | null} The textual message, or null if not found.
         */
        getTextualMessageOrNull: function (context) {
            if (!context || !context[0] || !context[0].plainText) {
                return null;
            }
            return context[0].plainText || null;
        }
    }
};
