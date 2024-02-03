/**
 * Namespace containing ANSI escape codes for text and background colors, as well as formatting options.
 * @namespace CliColor
 */
export namespace CliColor {
  /**
   * Reset all ANSI formatting.
   * @type {string}
   */
  export const Reset = "\x1b[0m";

  /**
   * Make text bright.
   * @type {string}
   */
  export const Bright = "\x1b[1m";

  /**
   * Make text dim.
   * @type {string}
   */
  export const Dim = "\x1b[2m";

  /**
   * Add underscore to text.
   * @type {string}
   */
  export const Underscore = "\x1b[4m";

  /**
   * Make text blink.
   * @type {string}
   */
  export const Blink = "\x1b[5m";

  /**
   * Reverse text background and foreground colors.
   * @type {string}
   */
  export const Reverse = "\x1b[7m";

  /**
   * Hide text (hidden).
   * @type {string}
   */
  export const Hidden = "\x1b[8m";

  /**
   * Set text foreground color to black.
   * @type {string}
   */
  export const FgBlack = "\x1b[30m";

  /**
   * Set text foreground color to red.
   * @type {string}
   */
  export const FgRed = "\x1b[31m";

  /**
   * Set text foreground color to green.
   * @type {string}
   */
  export const FgGreen = "\x1b[32m";

  /**
   * Set text foreground color to yellow.
   * @type {string}
   */
  export const FgYellow = "\x1b[33m";

  /**
   * Set text foreground color to blue.
   * @type {string}
   */
  export const FgBlue = "\x1b[34m";

  /**
   * Set text foreground color to magenta.
   * @type {string}
   */
  export const FgMagenta = "\x1b[35m";

  /**
   * Set text foreground color to cyan.
   * @type {string}
   */
  export const FgCyan = "\x1b[36m";

  /**
   * Set text foreground color to white.
   * @type {string}
   */
  export const FgWhite = "\x1b[37m";

  /**
   * Set text foreground color to gray.
   * @type {string}
   */
  export const FgGray = "\x1b[90m";

  /**
   * Set background color to black.
   * @type {string}
   */
  export const BgBlack = "\x1b[40m";

  /**
   * Set background color to red.
   * @type {string}
   */
  export const BgRed = "\x1b[41m";

  /**
   * Set background color to green.
   * @type {string}
   */
  export const BgGreen = "\x1b[42m";

  /**
   * Set background color to yellow.
   * @type {string}
   */
  export const BgYellow = "\x1b[43m";

  /**
   * Set background color to blue.
   * @type {string}
   */
  export const BgBlue = "\x1b[44m";

  /**
   * Set background color to magenta.
   * @type {string}
   */
  export const BgMagenta = "\x1b[45m";

  /**
   * Set background color to cyan.
   * @type {string}
   */
  export const BgCyan = "\x1b[46m";

  /**
   * Set background color to white.
   * @type {string}
   */
  export const BgWhite = "\x1b[47m";

  /**
   * Set background color to gray.
   * @type {string}
   */
  export const BgGray = "\x1b[100m";
}
