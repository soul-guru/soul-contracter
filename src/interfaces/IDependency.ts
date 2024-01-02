/**
 * Represents a generic dependency with specific configuration options.
 * @template T - The type of the dependency instance.
 */
export interface IDependency<T> {
  /**
   * The name of the dependency.
   */
  readonly name: string;

  /**
   * An array of host names that require this dependency.
   * @example
   * ```typescript
   * ['host1', 'host2']
   * ```
   */
  readonly requireHosts: string[];

  /**
   * A function to bootstrap or initialize the dependency.
   */
  readonly bootstrap: () => void;

  /**
   * A function that returns a Promise resolving to the instance of the dependency,
   * or null if the instance cannot be created.
   * @returns {Promise<T | null>}
   */
  readonly instance: () => Promise<T | null>;

  /**
   * An optional callback function that is called after creating the dependency instance.
   * @param {T | null} instance - The created instance or null if creation failed.
   */
  readonly postCreate?: (instance: T | null) => void;
}
