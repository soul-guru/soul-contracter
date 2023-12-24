import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export class ResolverOpenAI {
  async take(text: string) {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: text }],
      model: "gpt-3.5-turbo",
    });

    return chatCompletion;
  }
}
