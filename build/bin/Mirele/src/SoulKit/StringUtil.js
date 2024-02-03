"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringUtil = void 0;
class StringUtil {
    static makeid(length = 8) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }
    static getUrls(str, lower = false) {
        const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi;
        const bracketsRegexp = /[()]/g;
        if (typeof str !== "string") {
            throw new TypeError(`The str argument should be a string, got ${typeof str}`);
        }
        if (str) {
            let urls = str.match(regexp);
            if (urls) {
                return lower ? urls.map((item) => item.toLowerCase().replace(bracketsRegexp, "")) : urls.map((item) => item.replace(bracketsRegexp, ""));
            }
            else {
                return undefined;
            }
        }
        else {
            return undefined;
        }
    }
    static makeRandomAlphanumericString(length = 8) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    static truncateWithEllipsis(text, maxLength) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength - 3) + '...';
        }
        return text;
    }
    static capitalizeFirstLetter(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    static reverseString(text) {
        return text.split('').reverse().join('');
    }
    static countSubstringOccurrences(text, search) {
        const regex = new RegExp(search, 'g');
        const matches = text.match(regex);
        return matches ? matches.length : 0;
    }
    static startsWith(text, prefix) {
        return text.startsWith(prefix);
    }
    static endsWith(text, suffix) {
        return text.endsWith(suffix);
    }
    static removeWhitespace(text) {
        return text.replace(/\s+/g, '');
    }
    static toLowerCase(text) {
        return text.toLowerCase();
    }
    static toUpperCase(text) {
        return text.toUpperCase();
    }
    static isEmpty(text) {
        return text.trim() === '';
    }
    static isNumeric(text) {
        return /^\d+$/.test(text);
    }
    static splitString(text, delimiter) {
        return text.split(delimiter);
    }
    static joinStrings(array, separator) {
        return array.join(separator);
    }
    static removeSubstring(text, substring) {
        return text.split(substring).join('');
    }
    static toTitleCase(text) {
        return text
            .split(' ')
            .map(word => StringUtil.capitalizeFirstLetter(word))
            .join(' ');
    }
    static isPalindrome(text) {
        const cleanText = text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const reversedText = StringUtil.reverseString(cleanText);
        return cleanText === reversedText;
    }
    static trimWhitespace(text) {
        return text.trim();
    }
    static replaceAll(text, oldSubstring, newSubstring) {
        return text.split(oldSubstring).join(newSubstring);
    }
    static isAlphabetic(text) {
        return /^[a-zA-Z]+$/.test(text);
    }
    static containsSubstring(text, substring) {
        return text.includes(substring);
    }
    static escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    static isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return emailRegex.test(email);
    }
    static removeNonAlphanumeric(text) {
        return text.replace(/[^a-zA-Z0-9]/g, '');
    }
    static toSnakeCase(text) {
        return text
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .toLowerCase();
    }
    static toCamelCase(text) {
        return text
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, character) => character.toUpperCase())
            .replace(/[^a-zA-Z0-9]/g, '');
    }
    static repeatString(text, count) {
        return text.repeat(count);
    }
    static containsOnlyWhitespace(text) {
        return /^\s+$/.test(text);
    }
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    static countWords(text) {
        const words = text.split(/\s+/);
        return words.length;
    }
    static isAlphabeticWithSpaces(text) {
        return /^[a-zA-Z\s]+$/.test(text);
    }
    static removeDiacritics(text) {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    static isValidIPv4(ipAddress) {
        const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Regex.test(ipAddress);
    }
}
exports.StringUtil = StringUtil;
//# sourceMappingURL=StringUtil.js.map