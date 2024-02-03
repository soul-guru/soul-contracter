import { Call } from "./Call";
import { HuggingFaceModule } from "./modules/HuggingFace";

// @ts-ignore
export const ModulesKit = {
  /**
   *
   * @param {{token: string, model: string}} configs
   */
  huggingFace: (configs: { token: string; model: string; }) => new HuggingFaceModule(configs),

  bm3d_horizon: {
    listen: new Call(
      "http://62.197.49.215:1101/opt/brain/listen",
      "bm3d Horizon",
      "",
      {
        "body": "Hello, I am a John!",
        "namespace": "DIALOG_ID or USER_ID"
      }
    ),

    find: new Call(
      "http://62.197.49.215:1101/opt/brain/find",
      "bm3d Horizon",
      "",
      {
        "body": "Hello, I am a John!",
        "namespace": "DIALOG_ID or USER_ID"
      }
    )
  }
}