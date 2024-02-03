import cryptoObject from "crypto";

/**
 * Utility class for performing cryptographic operations.
 */
export default class CryptoFlow {
  private static _key: string = null;

  /**
   * Get the current encryption key.
   * @returns {string} The encryption key.
   */
  static get key(): string {
    return this._key;
  }

  /**
   * Set the encryption key.
   * @param {string} value - The new encryption key.
   */
  static set key(value: string) {
    this._key = value;
  }

  /**
   * Generates a random password of a specified length.
   * @param {number} [passwordLength=128] - The length of the password to generate.
   * @returns {string} The generated password.
   */
  static generatePassword(passwordLength: number = 128): string {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let password = "";

    for (let i = 0; i < passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * chars.length);
      password += chars.charAt(randomNumber);
    }

    return password;
  }

  /**
   * Encrypts a plain text using AES-256-CBC encryption.
   * @param {string} plainText - The plain text to encrypt.
   * @returns {string} The encrypted text in hexadecimal format.
   */
  static toEncrypted(plainText: string): string {
    if (!this.key) {
      throw new Error('Encryption key is not set.');
    }

    const algorithm = 'aes-256-cbc';
    const cipher = cryptoObject.createCipher(algorithm, this._key);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypts an encrypted text using AES-256-CBC decryption.
   * @param {string} encryptedText - The encrypted text in hexadecimal format.
   * @returns {string} The decrypted plain text.
   */
  static toDecrypted(encryptedText: string): string {
    if (!this.key) {
      throw new Error('Decryption key is not set.');
    }

    const algorithm = 'aes-256-cbc';
    const decipher = cryptoObject.createDecipher(algorithm, this._key);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
