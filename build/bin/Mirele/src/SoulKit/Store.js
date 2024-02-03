"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
class Store {
    dialogId;
    init;
    store = {};
    constructor(dialogId, init) {
        this.dialogId = dialogId;
        this.init = init;
    }
    getReference() {
        if (!this.hasStore(this.dialogId)) {
            this.store[this.dialogId] = { ...this.init };
        }
        return this.getStore(this.dialogId);
    }
    clear(dialogId) {
        if (this.hasStore(dialogId)) {
            delete this.store[dialogId];
        }
    }
    getDialogsWithStores() {
        return Object.keys(this.store);
    }
    hasStore(dialogId) {
        return this.store.hasOwnProperty(dialogId);
    }
    getStore(dialogId) {
        return this.store[dialogId];
    }
}
exports.Store = Store;
//# sourceMappingURL=Store.js.map