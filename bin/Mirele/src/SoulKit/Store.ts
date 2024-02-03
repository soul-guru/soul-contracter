/**
 * Represents a reference structure for a store containing messages and data.
 */
export interface StoreReference {
  msg: any[];
  data: { [key: string]: string };
}


export class Store<T extends StoreReference> {
  private readonly dialogId: string;
  private readonly init: T;
  private readonly store: Record<string, T> = {};

  constructor(dialogId: string, init: T) {
    this.dialogId = dialogId;
    this.init = init;
  }

  /**
   * Gets the reference to the store for the specified dialog.
   * If the store does not exist for the dialog, it will be created with the initial values.
   * @returns The store reference for the dialog.
   */
  getReference(): T {
    if (!this.hasStore(this.dialogId)) {
      this.store[this.dialogId] = { ...this.init };
    }

    return this.getStore(this.dialogId);
  }

  /**
   * Clears the store for the specified dialog.
   * @param dialogId - The unique identifier for the dialog to clear.
   */
  clear(dialogId: string): void {
    if (this.hasStore(dialogId)) {
      delete this.store[dialogId];
    }
  }

  /**
   * Retrieves the keys of all dialogs that have a store.
   * @returns An array of dialog IDs with stores.
   */
  getDialogsWithStores(): string[] {
    return Object.keys(this.store);
  }

  /**
   * Checks if a store exists for a specific dialog.
   * @param dialogId - The unique identifier for the dialog to check.
   * @returns True if a store exists for the dialog, false otherwise.
   */
  hasStore(dialogId: string): boolean {
    return this.store.hasOwnProperty(dialogId);
  }

  /**
   * Retrieves the store for a specific dialog.
   * @param dialogId - The unique identifier for the dialog to retrieve the store for.
   * @returns The store object for the specified dialog, or undefined if it doesn't exist.
   */
  getStore(dialogId: string): T | undefined {
    return this.store[dialogId];
  }
}
