"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedModule = void 0;
class Module {
}
class TypedModule extends Module {
    _configs;
    getConfig(name = null) {
        if (typeof name != "string") {
            return this._configs;
        }
        else {
            return this._configs[name];
        }
    }
    constructor(configs) {
        super();
        this._configs = configs;
    }
    async create(value) {
        return null;
    }
}
exports.TypedModule = TypedModule;
//# sourceMappingURL=Module.js.map