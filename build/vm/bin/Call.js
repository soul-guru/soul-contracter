"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Call = void 0;
const axios_1 = require("./opt/axios");
class Call {
    url;
    isActive = true;
    name;
    description;
    exampleBody = {};
    _headers;
    constructor(url, name, description, exampleBody, headers = {}) {
        this.url = url;
        this.name = name;
        this.exampleBody = exampleBody;
        this.description = description;
        this._headers = headers;
    }
    async call(body, headers = {}) {
        if (!this.isActive) {
            return null;
        }
        let config = {
            url: this.url,
            data: body,
            headers: {
                'Content-Type': 'application/json',
                ...this._headers,
                ...headers
            },
            method: 'POST'
        };
        return (await (0, axios_1.axios)(config)).data;
    }
}
exports.Call = Call;
//# sourceMappingURL=Call.js.map