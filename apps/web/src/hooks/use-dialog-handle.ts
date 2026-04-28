import { Dialog } from "@base-ui/react/dialog";
import { useState } from "react";

export function useDialogHandle<T = undefined>(): Dialog.Handle<T> {
  const [state] = useState(() => Dialog.createHandle<T>());
  return state;
}
