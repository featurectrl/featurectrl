import {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { createPortal } from "react-dom";

const SlotContext = createContext<{
  slots: ReadonlyMap<string, HTMLElement>;
  mountSlot: (name: string, value: HTMLElement | null) => void;
} | null>(null);

export function SlotProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<ReadonlyMap<string, HTMLElement>>(new Map());

  const mountSlot = useCallback((name: string, value: HTMLElement | null) => {
    setSlots((prevState) => {
      const newState = new Map(prevState);

      if (value === null) {
        newState.delete(name);
      } else {
        newState.set(name, value);
      }

      return newState;
    });
  }, []);

  return <SlotContext.Provider value={{ slots, mountSlot }}>{children}</SlotContext.Provider>;
}

export function createSlot(name: string) {
  function Target(props: HTMLAttributes<HTMLDivElement>) {
    const ctx = useContext(SlotContext);
    if (!ctx) {
      throw new Error("Slot.Target must be rendered inside SlotProvider");
    }

    const setRef = useCallback(
      (el: HTMLElement | null) => {
        ctx.mountSlot(name, el);
      },
      [ctx.mountSlot],
    );

    return <div ref={setRef} {...props} />;
  }

  function Content({ children }: { children: ReactNode }) {
    const ctx = useContext(SlotContext);
    if (!ctx) {
      throw new Error("Slot.Content must be rendered inside SlotProvider");
    }

    const slot = ctx.slots.get(name);
    if (!slot) {
      return null;
    }
    return createPortal(children, slot);
  }

  return {
    Target,
    Content,
  };
}
