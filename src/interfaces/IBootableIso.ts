/**
 * Represents the configuration for a bootable ISO.
 */
export interface IBootableIso {
  /**
   * The environment configuration for the bootable ISO.
   * @example
   * ```typescript
   * {
   *   key1: 'value1',
   *   key2: 123,
   *   key3: true,
   *   // ...
   * }
   * ```
   */
  env: {[key: string]: any};
}