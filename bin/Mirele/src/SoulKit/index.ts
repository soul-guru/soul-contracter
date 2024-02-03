import {Store, StoreReference} from "./Store";

export class Kit {
  /**
   * Creates a new instance of the SoloSDK class.
   * @param huggingFaceToken - The authorization token for Hugging Face API.
   */
  constructor(huggingFaceToken: string) {
    this.huggingFaceToken = huggingFaceToken;
  }

  /**
   * The authorization token for Hugging Face API.
   */
  private readonly huggingFaceToken: string;

  /**
   * Generates an answer using the OpenChat model.
   * @param messages - The input messages for the conversation.
   * @returns A promise that resolves to the generated text response.
   */
  public generateAnswerWithOpenChat({ messages }): Promise<{ text: string }> {
    return new Promise((resolve, reject) => {
      $foundation
        .$modules()
        .huggingFace({
          token: this.huggingFaceToken,
          model: "openchat/openchat-3.5-0106",
        })
        .create()
        .then((moduleCall) => {
          moduleCall
            .call({
              inputs: messages,
              temperature: 80.0,
            })
            .then((out) => {
              const result = $foundation
                .$array
                .asHuggingFaceGeneratedText(out, messages);

              resolve({
                text: result,
              });
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }
}

/**
 * Creates a new instance of the SoloSDK class with the specified token.
 * @param token - The authorization token for Hugging Face API.
 * @returns A new instance of the SoloSDK class.
 */
export const $kit = (token: string) => new Kit(token);

let _factory = {};

/**
 * Creates or retrieves a store instance for the specified dialog.
 * @param dialogId - The unique identifier for the dialog.
 * @param init - The initial data and message structure for the store (optional).
 * @returns The store instance associated with the dialog.
 */
export const $store = (dialogId: string, init: StoreReference = { msg: [], data: {} }) => {
  if (!_factory.hasOwnProperty(dialogId)) {
    _factory[dialogId] = new Store(dialogId, init);
  }

  return _factory[dialogId];
};
