import { useMemo } from "react";

import * as colorlib from "colorlib";

export type ContrastToken = "dark" | "light";

export function contrastToken(l: number, threshold = 0.5): ContrastToken {
  return l < threshold ? "light" : "dark";
}

export function luminanceFromHex(hex: colorlib.Hex): number {
  return colorlib.HCL.from_hex(hex.to_code()).l;
}

export function useContrastToken(getLuminance: () => number, threshold = 0.5) {
  return useMemo(
    () => contrastToken(getLuminance(), threshold),
    [getLuminance, threshold],
  );
}
