import {TypedModule} from "../Module";
import {Call} from "../Call";
import {occurrences} from "../init";

export class HuggingFaceModule extends TypedModule {
  async create() {
    if (occurrences(this.getConfig<string>('model') as string, '/') != 1) {
      throw "Incorrectly passed model path-name"
    }

    return new Call(
      `https://api-inference.huggingface.co/models/${this.getConfig('model')}`,
      "",
      "",
      {
        inputs: "string"
      },
      {
        "Authorization": `Bearer ${this.getConfig("token")}`
      }
    )
  }
}