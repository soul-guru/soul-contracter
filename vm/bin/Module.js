// Load basics
var Module = /** @class */ (function () {
    function Module(url, name, description, exampleBody) {
        this.isActive = true;
        this.exampleBody = {};
        this.url = url;
        this.name = name;
        this.exampleBody = exampleBody;
        this.description = description;
    }
    Module.prototype.call = function (body) {
        var config = {
            url: this.url,
            data: body,
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        };
        //@ts-ignore
        return axios(config);
    };
    return Module;
}());
