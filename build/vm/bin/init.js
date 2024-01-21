function safeSignal(functionName, context, args = null) {
    if (context && context[functionName] != null) {
        const results = context[functionName](args);
        log(`s(${functionName}): success`);
        return results;
    }
    else {
        log(`safeSignal ->>> (${functionName}): not found`);
    }
}
const NetworkingJSON = network_request_json || null;
const NetworkingRAW = network_request_raw || null;
class OpenAI {
    apiKey;
    model;
    constructor(apiKey, model = 'gpt-3.5-turbo') {
        this.apiKey = apiKey;
        this.model = model;
    }
    make({ text }) {
        return NetworkingJSON('https://api.openai.com/v1/chat/completions', {
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: 'user', content: text }],
                temperature: 0,
                max_tokens: 2048,
            }),
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
        });
    }
}
class Essent {
    task(taskName, model, value) {
        return NetworkingJSON(`http://soul-essent:8080/task/${taskName}?model=${model}`, {
            body: JSON.stringify({
                value
            }),
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
        });
    }
    snippet(snippetName, body) {
        return NetworkingRAW(`http://soul-essent:8080/snippet/${snippetName}`, {
            body: JSON.stringify({
                ...body
            }),
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
        });
    }
    intent(text) {
        return NetworkingJSON('http://soul-essent:8080/nlp/intent', {
            body: JSON.stringify({
                value: text
            }),
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
        });
    }
    emotion(text) {
        return NetworkingJSON('http://soul-essent:8080/nlp/emotion', {
            body: JSON.stringify({
                value: text
            }),
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
        });
    }
}
//# sourceMappingURL=init.js.map