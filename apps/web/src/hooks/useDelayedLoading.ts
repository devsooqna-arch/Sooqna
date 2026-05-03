"use client";

import { useEffect, useRef, useState } from "react";

/** Keeps loading UI visible at least `minMs` to avoid flicker on fast responses. */
export function useDelayedLoading(loading: boolean, minMs = 300): boolean {
  const [show, setShow] = useState(loading);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      startedAt.current = Date.now();
      setShow(true);
      return;
    }
    const start = startedAt.current ?? Date.now();
    const elapsed = Date.now() - start;
    const wait = Math.max(0, minMs - elapsed);
    const t = window.setTimeout(() => setShow(false), wait);
    return () => window.clearTimeout(t);
  }, [loading, minMs]);

  return show;
}
