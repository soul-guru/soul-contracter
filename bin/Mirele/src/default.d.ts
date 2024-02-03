declare function stdout(string: string)

declare interface IAnswerPlainText {dialogId: string, text: string}

declare const self: object = {}

declare const $schedule = {

}

/**
 * Represents the `$foundation` object providing various utility functions and modules.
 */
declare const $foundation: {
  $schedule: {
    create: (time: string, link: string) => {}
  },
  /**
   * Modules within the `$foundation` object.
   */
  $modules: () => ({
    /**
     * Provides functionality related to Hugging Face models.
     * @param token - The authorization token for Hugging Face API.
     * @param model - The model to be used for interactions.
     */
    huggingFace: ({ token, model }: { token: string, model: string }) => ({
      /**
       * Creates a new instance for interacting with a Hugging Face model.
       * @returns A promise that resolves to a new instance.
       */
      create: () => Promise<any>
    })
  }),
  $string: {},
  $array: {
    /**
     * Converts an array to Hugging Face generated text format.
     * @param array - The input array.
     * @param removeThis - An optional string to remove from the text.
     * @returns A null string (not implemented).
     */
    asHuggingFaceGeneratedText(readonly array, readonly removeThis?: string): null | string;

    /**
     * Converts an array of messages to a conversation string.
     * @param array - An array of messages with roles and content.
     * @param isCompact
     * @param answerRequest
     * @returns A conversation string representing the messages.
     */
    asConversation(
      readonly array: { readonly role: 'assistant' | 'user' | 'system' | string, readonly content: string }[],
      readonly isCompact: boolean = true,
      readonly answerRequest: boolean = true
    ): string;
  },
  $object: {
    /**
     * Extracts a textual message from a context object, if available.
     * @param context - The context object.
     * @returns The extracted textual message or null if not available.
     */
    getTextualMessageOrNull(context: any): string | null;
  },
  $dialog: {
    /**
     * Replies to a dialog with text data.
     * @param data - The text data to reply with.
     */
    replyWithText(data: IAnswerPlainText): void;
  }
}

/**
 * Represents an incoming signal message with context and dialogId.
 */
declare interface IIncomingSignalMessage {
  /**
   * Additional context information.
   */
  context: any;

  /**
   * The ID of the dialog associated with the signal message.
   */
  dialogId: string;
}

/**
 * Represents the available exports for a SoulWorker.
 */
declare interface SoulExports {
  $schedule: Record<string, () => void>,
  $worker: SoulWorker,

  /**
   * A function that is executed when the SoulWorker boots.
   * @returns A promise that resolves when booting is complete.
   */
  onBoot?: () => Promise<void> | undefined;

  /**
   * A function that handles incoming messages in the SoulWorker.
   * @param data - The incoming signal message with context and dialogId.
   * @returns A promise that resolves when message handling is complete.
   */
  onMessage?: (data: IIncomingSignalMessage) => Promise<void>;
}

/**
 * Represents a SoulWorker with various event handlers.
 */
declare interface SoulWorker {
  /**
   * Handles events that occur at the beginning of a new day.
   * @returns A promise that resolves when the new day event is handled.
   */
  onNewDay?: () => Promise<void> | undefined;

  /**
   * Handles a random impulse of life in the context of a dialog.
   * @param dialogId - The ID of the dialog associated with the impulse.
   * @param context - Additional context information for the impulse.
   * @returns A promise that resolves when the impulse is handled.
   */
  onRandomImpulseOfLife?: ({ dialogId, context }: { dialogId: string, context: any }) => Promise<void> | undefined;

  /**
   * Handles the event when there is a long time of silence in a dialog.
   * @param dialogId - The ID of the dialog with long-time silence.
   */
  onLongTimeSilent?: ({ dialogId }: { dialogId: string }) => void | undefined;
}
