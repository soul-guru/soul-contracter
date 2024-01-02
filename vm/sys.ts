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

type NetworkingImpl = (url: string, params: object) => any;

// @ts-ignore
const NetworkingJSON: NetworkingImpl = network_request_json || null;

class OpenAI {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string = "gpt-3.5-turbo") {
    this.apiKey = apiKey;
    this.model = model;
  }

  make({ text }) {
    return NetworkingJSON(`https://api.openai.com/v1/chat/completions`, {
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: text }],
        temperature: 0,
        max_tokens: 2048,
      }),
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }
}


function roughSizeOfObject(object) {
  const objectList = [];
  const stack = [object];
  let bytes = 0;

  while (stack.length) {
    const value = stack.pop();

    switch (typeof value) {
      case 'boolean':
        bytes += 4;
        break;
      case 'string':
        bytes += value.length * 2;
        break;
      case 'number':
        bytes += 8;
        break;
      case 'object':
        if (!objectList.includes(value)) {
          objectList.push(value);
          for (const prop in value) {
            if (value.hasOwnProperty(prop)) {
              stack.push(value[prop]);
            }
          }
        }
        break;
    }
  }

  return bytes;
}


// @ts-ignore
log({context: Object.getOwnPropertyNames(this)})