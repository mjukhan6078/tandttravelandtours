"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { formatPKR } from "@/lib/site/pricing";

/** PKR amount that animates between values. */
export function AnimatedPKR({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value]);

  return <span className={className}>{formatPKR(display)}</span>;
}
