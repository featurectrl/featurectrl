import type { Dialog } from "@base-ui/react/dialog";

export function useDialogHandlePayload<P = void>(handler: Dialog.Handle<P>): P | undefined {
  return handler.store.useState("payload") as P | undefined;
}
