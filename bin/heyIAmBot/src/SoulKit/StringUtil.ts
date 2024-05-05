export class StringUtil {
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

  /**
   * Get URLs from a string.
   * @param {string} str - The input string.
   * @param {boolean} lower - Whether to convert URLs to lowercase.
   * @returns {string[] | undefined} An array of URLs found in the input string, or undefined if no URLs are found.
   * @throws {TypeError} Throws a TypeError if the `str` argument is not a string.
   */
  static getUrls(
    str: string,
    lower = false
  ): string[] | undefined {
    const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi;
    const bracketsRegexp = /[()]/g;

    if (typeof str !== "string") {
      throw new TypeError(`The str argument should be a string, got ${typeof str}`);
    }

    if (str) {
      let urls = str.match(regexp);
      if (urls) {
        return lower ? urls.map((item) => item.toLowerCase().replace(bracketsRegexp, "")) : urls.map((item) => item.replace(bracketsRegexp, ""));
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  /**
   * Generates a random alphanumeric string of the specified length.
   * @param length - The length of the generated string (default is 8).
   * @returns A random alphanumeric string.
   */
  static makeRandomAlphanumericString(length = 8): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * Truncates a string to the specified maximum length and appends an ellipsis if truncated.
   * @param text - The input string to truncate.
   * @param maxLength - The maximum length of the truncated string.
   * @returns The truncated string with an ellipsis if applicable.
   */
  static truncateWithEllipsis(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + '...';
    }
    return text;
  }

  /**
   * Capitalizes the first letter of a string.
   * @param text - The input string.
   * @returns The string with the first letter capitalized.
   */
  static capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Reverses a string.
   * @param text - The input string to reverse.
   * @returns The reversed string.
   */
  static reverseString(text: string): string {
    return text.split('').reverse().join('');
  }

  /**
   * Counts the number of occurrences of a substring in a string.
   * @param text - The input string.
   * @param search - The substring to search for.
   * @returns The number of occurrences of the substring.
   */
  static countSubstringOccurrences(text: string, search: string): number {
    const regex = new RegExp(search, 'g');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * Checks if a string starts with a specified prefix.
   * @param text - The input string.
   * @param prefix - The prefix to check.
   * @returns True if the string starts with the prefix, false otherwise.
   */
  static startsWith(text: string, prefix: string): boolean {
    return text.startsWith(prefix);
  }

  /**
   * Checks if a string ends with a specified suffix.
   * @param text - The input string.
   * @param suffix - The suffix to check.
   * @returns True if the string ends with the suffix, false otherwise.
   */
  static endsWith(text: string, suffix: string): boolean {
    return text.endsWith(suffix);
  }

  /**
   * Removes all whitespace characters (including spaces, tabs, and newlines) from a string.
   * @param text - The input string.
   * @returns The string with all whitespace characters removed.
   */
  static removeWhitespace(text: string): string {
    return text.replace(/\s+/g, '');
  }

  /**
   * Converts a string to lowercase.
   * @param text - The input string.
   * @returns The string in lowercase.
   */
  static toLowerCase(text: string): string {
    return text.toLowerCase();
  }

  /**
   * Converts a string to uppercase.
   * @param text - The input string.
   * @returns The string in uppercase.
   */
  static toUpperCase(text: string): string {
    return text.toUpperCase();
  }

  /**
   * Checks if a string is empty (contains only whitespace).
   * @param text - The input string.
   * @returns True if the string is empty, false otherwise.
   */
  static isEmpty(text: string): boolean {
    return text.trim() === '';
  }

  /**
   * Checks if a string contains only numeric characters.
   * @param text - The input string.
   * @returns True if the string contains only numeric characters, false otherwise.
   */
  static isNumeric(text: string): boolean {
    return /^\d+$/.test(text);
  }

  /**
   * Splits a string into an array of substrings using a delimiter.
   * @param text - The input string to split.
   * @param delimiter - The delimiter used for splitting.
   * @returns An array of substrings.
   */
  static splitString(text: string, delimiter: string): string[] {
    return text.split(delimiter);
  }

  /**
   * Joins an array of strings into a single string using a specified separator.
   * @param array - The array of strings to join.
   * @param separator - The separator to use for joining.
   * @returns The joined string.
   */
  static joinStrings(array: string[], separator: string): string {
    return array.join(separator);
  }

  /**
   * Removes all occurrences of a substring from a string.
   * @param text - The input string.
   * @param substring - The substring to remove.
   * @returns The string with all occurrences of the substring removed.
   */
  static removeSubstring(text: string, substring: string): string {
    return text.split(substring).join('');
  }

  /**
   * Converts a string to title case (capitalizes the first letter of each word).
   * @param text - The input string.
   * @returns The string in title case.
   */
  static toTitleCase(text: string): string {
    return text
      .split(' ')
      .map(word => StringUtil.capitalizeFirstLetter(word))
      .join(' ');
  }

  /**
   * Checks if a string is a palindrome (reads the same forwards and backwards).
   * @param text - The input string.
   * @returns True if the string is a palindrome, false otherwise.
   */
  static isPalindrome(text: string): boolean {
    const cleanText = text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const reversedText = StringUtil.reverseString(cleanText);
    return cleanText === reversedText;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   * @param text - The input string.
   * @returns The string with leading and trailing whitespace removed.
   */
  static trimWhitespace(text: string): string {
    return text.trim();
  }

  /**
   * Replaces all occurrences of a substring with a new string.
   * @param text - The input string.
   * @param oldSubstring - The substring to replace.
   * @param newSubstring - The new substring to replace with.
   * @returns The string with all occurrences of the old substring replaced.
   */
  static replaceAll(text: string, oldSubstring: string, newSubstring: string): string {
    return text.split(oldSubstring).join(newSubstring);
  }

  /**
   * Checks if a string contains only alphabetic characters (letters).
   * @param text - The input string.
   * @returns True if the string contains only alphabetic characters, false otherwise.
   */
  static isAlphabetic(text: string): boolean {
    return /^[a-zA-Z]+$/.test(text);
  }

  /**
   * Checks if a string contains a specific substring.
   * @param text - The input string.
   * @param substring - The substring to search for.
   * @returns True if the string contains the substring, false otherwise.
   */
  static containsSubstring(text: string, substring: string): boolean {
    return text.includes(substring);
  }

  /**
   * Escapes special characters in a string to make it safe for use in regular expressions.
   * @param text - The input string.
   * @returns The string with special characters escaped.
   */
  static escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Checks if a string is a valid email address.
   * @param email - The input email address.
   * @returns True if the string is a valid email address, false otherwise.
   */
  static isValidEmail(email: string): boolean {
    // Regular expression for validating email addresses
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

  /**
   * Removes all non-alphanumeric characters from a string.
   * @param text - The input string.
   * @returns The string with all non-alphanumeric characters removed.
   */
  static removeNonAlphanumeric(text: string): string {
    return text.replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Converts a string to snake_case.
   * @param text - The input string.
   * @returns The string in snake_case.
   */
  static toSnakeCase(text: string): string {
    return text
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase();
  }

  /**
   * Converts a string to camelCase.
   * @param text - The input string.
   * @returns The string in camelCase.
   */
  static toCamelCase(text: string): string {
    return text
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, character) => character.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '');
  }

  /**
   * Repeats a string a specified number of times.
   * @param text - The input string to repeat.
   * @param count - The number of times to repeat the string.
   * @returns The repeated string.
   */
  static repeatString(text: string, count: number): string {
    return text.repeat(count);
  }

  /**
   * Checks if a string contains only whitespace characters.
   * @param text - The input string.
   * @returns True if the string contains only whitespace characters, false otherwise.
   */
  static containsOnlyWhitespace(text: string): boolean {
    return /^\s+$/.test(text);
  }

  /**
   * Checks if a string is a valid URL.
   * @param url - The input URL.
   * @returns True if the string is a valid URL, false otherwise.
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Counts the number of words in a string.
   * @param text - The input string.
   * @returns The number of words in the string.
   */
  static countWords(text: string): number {
    const words = text.split(/\s+/);
    return words.length;
  }

  /**
   * Checks if a string contains only alphabetic characters and spaces.
   * @param text - The input string.
   * @returns True if the string contains only alphabetic characters and spaces, false otherwise.
   */
  static isAlphabeticWithSpaces(text: string): boolean {
    return /^[a-zA-Z\s]+$/.test(text);
  }

  /**
   * Removes diacritics (accents) from a string.
   * @param text - The input string with diacritics.
   * @returns The string with diacritics removed.
   */
  static removeDiacritics(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Checks if a string is a valid IPv4 address.
   * @param ipAddress - The input IPv4 address.
   * @returns True if the string is a valid IPv4 address, false otherwise.
   */
  static isValidIPv4(ipAddress: string): boolean {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(ipAddress);
  }
}