import {ModulesKit} from "./ModulesKit";

const self: object = this
 
/**
 * The `$foundation` object contains various utility functions and methods.
 */
// @ts-ignore
export default $foundation = {
  /**
   * The `$system` object contains system-related functions.
   */
  $system: {},

  /**
   * Represents the `$schedule` object for scheduling tasks.
   */
  $schedule: {
    /**
     * Creates a new scheduled job to execute a task at a specific time.
     * @param time - The time at which the task should be executed (e.g., a cron expression or a specific time).
     * @param link - The link or reference to the task to be executed. ($schedule.{link})
     */
    create(time: string, link: string): void {
      if (!self['$schedule'] || !self['$schedule'].hasOwnProperty(link)) {
        throw `You are trying to register a job with a reference to a non-existent object in the schedule repository. $schedule.${link} not found`
      }
      
      //@ts-ignore
      SYSTEM.createScheduleJob(time, link);
    }
  },

  $modules: () => ModulesKit,

  $object: {
    /**
     * Get the textual message from a context object.
     * @param {any[]} context - An array of context objects.
     * @returns {string | null} The textual message, or null if not found.
     */
    getTextualMessageOrNull(context: { plainText: any; }[]): string | null {
      if (!context || !context[0] || !context[0].plainText) {
        return null;
      }

      return context[0].plainText || null;
    },
  },

  $array: {
    /**
     * Converts an array to Hugging Face generated text format.
     * @param array - The input array.
     * @param removeThis - An optional string to remove from the text.
     * @returns The generated text or null if not available.
     */
    asHuggingFaceGeneratedText(array: [] | any, removeThis: string = ''): string | null {
      if (array[0] && array[0]['generated_text']) {
        return (array[0]['generated_text']).replace(removeThis.trim(), '').trim();
      }

      return null;
    },

    /**
     * Converts an array of messages to a conversation string.
     * @param array - An array of messages with roles and content.
     * @param isCompact - Whether to compact the conversation (default is true).
     * @param answerRequest - Whether to include an empty assistant message (default is true).
     * @returns The conversation string.
     */
    asConversation(
      array: { role: 'assistant' | 'user' | 'system'; content: string }[],
      isCompact: boolean = true,
      answerRequest: boolean = true
    ): string {
      if (answerRequest) {
        array.push({
          role: 'assistant',
          content: '',
        });
      }

      return array
        .flatMap(({ role, content }) => {
          if (isCompact && content.replace(" ", '').trim().length == 0) {
            return [];
          }

          if (role == 'assistant' || role == 'user' || role == 'system') {
            return `${role}: ${content}`;
          }

          return [];
        })
        .join("<|end_of_turn|>") + "\n";
    },
  },

  /**
   * The `$dialog` object contains dialog-related functions.
   */
  $dialog: {
    /**
     * Reply with a plain text message in a dialog.
     * @param {string} dialogId - The ID of the dialog.
     * @param {string} text - The text message to send.
     * @returns {null} Returns null if either `text` or `dialogId` is not provided.
     */
    replyWithText({dialogId, text}): null {
      if (!text || !dialogId) {
        return null;
      }

      // @ts-ignore
      (SYSTEM || null)?.answerPlainText({
        dialogId,
        text: text.trim(),
      });

      return null;
    },

    replyWithGif({dialogId, src, alt}): null {
      if (!src || !dialogId) {
        return null;
      }

      // @ts-ignore
      (SYSTEM || null)?.answerGif({
        dialogId,
        src,
        gifDescription: alt,
      });

      return null;
    }
  },
};