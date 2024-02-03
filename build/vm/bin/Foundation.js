"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ModulesKit_1 = require("./ModulesKit");
const self = this;
exports.default = $foundation = {
    $system: {},
    $schedule: {
        create(time, link) {
            if (!self['$schedule'] || !self['$schedule'].hasOwnProperty(link)) {
                throw `You are trying to register a job with a reference to a non-existent object in the schedule repository. $schedule.${link} not found`;
            }
            SYSTEM.createScheduleJob(time, link);
        }
    },
    $modules: () => ModulesKit_1.ModulesKit,
    $object: {
        getTextualMessageOrNull(context) {
            if (!context || !context[0] || !context[0].plainText) {
                return null;
            }
            return context[0].plainText || null;
        },
    },
    $array: {
        asHuggingFaceGeneratedText(array, removeThis = '') {
            if (array[0] && array[0]['generated_text']) {
                return (array[0]['generated_text']).replace(removeThis.trim(), '').trim();
            }
            return null;
        },
        asConversation(array, isCompact = true, answerRequest = true) {
            if (answerRequest) {
                array.push({
                    role: 'assistant',
                    content: '',
                });
            }
            return array
                .flatMap(({ role, content }) => {
                if (isCompact && content.replace(" ", '').trim().length == 0) {
                    return [];
                }
                if (role == 'assistant' || role == 'user' || role == 'system') {
                    return `${role}: ${content}`;
                }
                return [];
            })
                .join("<|end_of_turn|>") + "\n";
        },
    },
    $dialog: {
        replyWithText({ dialogId, text }) {
            if (!text || !dialogId) {
                return null;
            }
            (SYSTEM || null)?.answerPlainText({
                dialogId,
                text: text.trim(),
            });
            return null;
        },
        replyWithGif({ dialogId, src, alt }) {
            if (!src || !dialogId) {
                return null;
            }
            (SYSTEM || null)?.answerGif({
                dialogId,
                src,
                gifDescription: alt,
            });
            return null;
        }
    },
};
//# sourceMappingURL=Foundation.js.map