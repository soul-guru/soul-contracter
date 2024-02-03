import {$kit, $store} from "./index";
import {StoreReference} from "./Store";

/**
 * Represents an Open Dialog instance that allows interaction with an AI assistant.
 */
export default class OpenDialog {
  /**
   * The prompt to start the conversation with.
   */
  private prompt: string;

  /**
   * The authorization token required for making API calls.
   */
  private readonly token: string;
  private _store: StoreReference;

  /**
   * Creates a new instance of the OpenDialog class.
   * @param prompt - The initial prompt for the conversation.
   * @param token - The authorization token for API access.
   */
  constructor(prompt: string, token: string) {
    this.prompt = prompt;
    this.token = token;
  }

  requestStore(dialogId: string): StoreReference {
    return $store(dialogId, {
      msg: [
        // Initialize the conversation with the provided prompt
        { "role": 'system', "content": this.prompt },
      ],
      data: {}
    }).getReference();
  }

  async onCreatedStore(store: StoreReference): Promise<StoreReference> {
    return store
  }

  async onObtainTextFromTextualMessage(context) {
    return $foundation
      .$object
      .getTextualMessageOrNull(context)
  }

  async onConversationConvert(array: any[]): Promise<string> {
    array = JSON.parse(JSON.stringify(array))

    let conversation = array
      .map(({ role, content }) => {
        if (content.replace(" ", '').trim().length == 0) {
          return null;
        }

        if (role == 'assistant' || role == 'user' || role == 'system') {
          return `${role}: ${content}`;
        }

        return null;
      })
      .filter(i => i != null)

    conversation.push("assistant: ");

    stdout(conversation.join("<|end_of_turn|>"))

    return conversation.join("<|end_of_turn|>") + "\n";

  }

  async onReplyTextualMessage(data: IAnswerPlainText) {
    // Send the assistant's response to the dialog
    return $foundation.$dialog.replyWithText(data);
  }

  async onPrepareAnswer(messages: any[]): Promise<{text: string}> {
    // Convert the conversation messages to the required format
    const _messages = await this.onConversationConvert(messages);

    stdout(_messages)

    const answer = await $kit(this.token)
      .generateAnswerWithOpenChat({ messages: _messages });

    // Add the assistant's response to the conversation
    this._store.msg.push({ "role": "assistant", "content": answer.text });

    return answer
  }

  /**
   * Initiates a conversation with the AI assistant.
   * @param dialogId - The unique identifier for the dialog.
   * @param context - Additional context information for the conversation.
   */
  async call({ dialogId, context }: { readonly dialogId: string; context: any }) {
    // Create a store to manage the conversation messages and data
    this._store = await this.onCreatedStore(this.requestStore(dialogId))

    // Extract the user's text input from the context
    const text = await this.onObtainTextFromTextualMessage(context)

    // Add the user's message to the conversation
    this._store.msg.push({ "role": "user", "content": text });

    // Generate a response from the AI assistant
    const result = await this.onPrepareAnswer(this._store.msg)

    await this.onReplyTextualMessage({
      ...result,
      dialogId
    })
  }
}
