"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type InquirePrefill = { interest?: string; message?: string };

type InquireContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  /** Values to pre-fill the next time the panel opens. */
  prefill: InquirePrefill;
  openWith: (prefill: InquirePrefill) => void;
};

const InquireContext = createContext<InquireContextValue | null>(null);

export function InquireProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const [prefill, setPrefill] = useState<InquirePrefill>({});

  const setOpen = useCallback((value: boolean) => {
    setOpenState(value);
    if (!value) setPrefill({});
  }, []);
  const toggle = useCallback(() => setOpenState((v) => !v), []);
  const openWith = useCallback((p: InquirePrefill) => {
    setPrefill(p);
    setOpenState(true);
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, toggle, prefill, openWith }),
    [open, setOpen, toggle, prefill, openWith]
  );
  return (
    <InquireContext.Provider value={value}>{children}</InquireContext.Provider>
  );
}

export function useInquire() {
  const ctx = useContext(InquireContext);
  if (!ctx) {
    throw new Error("useInquire must be used within InquireProvider");
  }
  return ctx;
}
