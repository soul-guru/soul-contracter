const cryptoObject = require('crypto');

export default class CryptoFlow {
  static get key(): string {
    return this._key;
  }

  static set key(value: string) {
    this._key = value;
  }

  private static _key: string = null

  static generatePassword(passwordLength: number = 128) {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let password = "";

    for (let i = 0; i <= passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.substring(randomNumber, randomNumber +1);
    }

    return password;
  }

  static toEncrypted(plainText: string) {
    const algorithm = 'aes-256-cbc';
    const cipher = cryptoObject.createCipher(algorithm, this._key);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted
  }

  static toDecrypted(encryptedText: string) {
    const algorithm = 'aes-256-cbc';
    const decipher = cryptoObject.createDecipher(algorithm, this._key);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted
  }
}