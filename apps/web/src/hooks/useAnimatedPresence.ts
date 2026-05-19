"use client";

import { useEffect, useState } from "react";

type MotionState = "enter" | "exit";

export function useAnimatedPresence(open: boolean, exitMs = 140) {
  const [shouldRender, setShouldRender] = useState(open);
  const [motionState, setMotionState] = useState<MotionState>(open ? "enter" : "exit");

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setMotionState("enter");
      return undefined;
    }

    setMotionState("exit");
    const timeout = window.setTimeout(() => {
      setShouldRender(false);
    }, exitMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, exitMs]);

  return { shouldRender, motionState };
}
