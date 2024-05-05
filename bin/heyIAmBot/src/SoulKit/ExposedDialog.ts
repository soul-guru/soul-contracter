import OpenDialog from "./OpenDialog";

export class ExposedDialog extends OpenDialog {
  async call({dialogId, context}: { readonly dialogId: string; context: any }): Promise<void> {
    super.call({dialogId, context});
  }
}