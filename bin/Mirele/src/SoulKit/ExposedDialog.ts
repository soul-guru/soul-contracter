import OpenDialog from "./OpenDialog";
import {context} from "@opentelemetry/api";

export class ExposedDialog extends OpenDialog {
  async call({dialogId, context}: { readonly dialogId: string; context: any }): Promise<void> {
    super.call({dialogId, context});
  }
}