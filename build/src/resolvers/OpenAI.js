"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolverOpenAI = void 0;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env["OPENAI_API_KEY"],
});
class ResolverOpenAI {
    async take(text) {
        const chatCompletion = await openai.chat.completions.create({
            messages: [{ role: "user", content: text }],
            model: "gpt-3.5-turbo",
        });
        return chatCompletion;
    }
}
exports.ResolverOpenAI = ResolverOpenAI;
//# sourceMappingURL=OpenAI.js.map