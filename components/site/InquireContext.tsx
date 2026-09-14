"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type InquireContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const InquireContext = createContext<InquireContextValue | null>(null);

export function InquireProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const value = useMemo(
    () => ({ open, setOpen, toggle }),
    [open, toggle]
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
