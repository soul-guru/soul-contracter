import {axios} from "./opt/axios";

/**
 * Represents a module with configurable properties and an API call functionality.
 */
// @ts-ignore
export class Call {
  /**
   * The URL endpoint for the module's API calls.
   * @private
   * @readonly
   */
  private readonly url: string;

  /**
   * Indicates whether the module is active.
   * @private
   */
  private isActive = true;

  /**
   * The name of the module.
   * @public
   */
  public name: string;

  /**
   * A brief description of the module.
   * @public
   */
  public description: string;

  /**
   * An example structure of the body expected by the API call.
   * @public
   */
  public exampleBody: object = {};

  private readonly _headers: { [p: string]: string };

  /**
   * Creates a new Call instance.
   * @param {string} url - The URL endpoint for the module's API calls.
   * @param {string} name - The name of the module.
   * @param {string} description - A brief description of the module.
   * @param {object} exampleBody - An example structure of the body expected by the API call.
   * @param headers
   */
  constructor(
    url: string,
    name: string,
    description: string,
    exampleBody: object,
    headers: {[key: string]: string} = {}
  ) {
    this.url = url;
    this.name = name;
    this.exampleBody = exampleBody;
    this.description = description;
    this._headers = headers;
  }

  /**
   * Makes an asynchronous API call to the module's URL with the provided body.
   * @param {object} body - The data to be sent in the API call.
   * @param headers
   * @returns {Promise<any>} A promise that resolves with the response data.
   */
  async call(body: object, headers: {[key: string]: string} = {}): Promise<any> {
    if (!this.isActive) {
      return null
    }

    let config = {
      url: this.url,
      data: body,
      headers: {
        'Content-Type': 'application/json',
        ...this._headers,
        ...headers
      },
      method: 'POST'
    };

    //@ts-ignore
    return (await axios(config)).data;
  }
}
