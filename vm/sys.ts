function safeSignal(functionName: string, context: string, ...args) {
  const namespaces = functionName.split(".");
  const func = namespaces.pop();

  if (func && context[func] != null) {
    for (let i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }

    return context[func].apply(null, args);
  }
}

type NetworkingImpl = (url: string, params: object) => any

// @ts-ignore
const NetworkingJSON: NetworkingImpl = network_request_json || null

class OpenAI {
  private readonly apiKey: string
  private readonly model: string

  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    this.apiKey = apiKey
    this.model = model
  }

  make({text}) {
    return NetworkingJSON(
      `https://api.openai.com/v1/chat/completions`,
      {
        body: JSON.stringify({"model": this.model, "messages": [
            {role: "user", content: text}
          ], "temperature": 0, "max_tokens": 2048}),
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    )
  }
}
