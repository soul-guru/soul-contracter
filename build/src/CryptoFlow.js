"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class CryptoFlow {
    static _key = null;
    static get key() {
        return this._key;
    }
    static set key(value) {
        this._key = value;
    }
    static generatePassword(passwordLength = 128) {
        const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let password = "";
        for (let i = 0; i < passwordLength; i++) {
            const randomNumber = Math.floor(Math.random() * chars.length);
            password += chars.charAt(randomNumber);
        }
        return password;
    }
    static toEncrypted(plainText) {
        if (!this.key) {
            throw new Error('Encryption key is not set.');
        }
        const algorithm = 'aes-256-cbc';
        const cipher = crypto_1.default.createCipher(algorithm, this._key);
        let encrypted = cipher.update(plainText, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }
    static toDecrypted(encryptedText) {
        if (!this.key) {
            throw new Error('Decryption key is not set.');
        }
        const algorithm = 'aes-256-cbc';
        const decipher = crypto_1.default.createDecipher(algorithm, this._key);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
exports.default = CryptoFlow;
//# sourceMappingURL=CryptoFlow.js.map