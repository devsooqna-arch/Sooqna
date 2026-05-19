import type { CSSProperties } from "react";

type MotionStaggerStyle = CSSProperties & {
  "--motion-delay"?: string;
};

export function getMotionStaggerStyle(index: number, maxIndex = 8): MotionStaggerStyle {
  const safeIndex = Math.min(Math.max(index, 0), maxIndex);
  return { "--motion-delay": `${safeIndex * 24}ms` };
}
