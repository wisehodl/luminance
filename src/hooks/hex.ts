import * as colorlib from "colorlib";

export const extractHexValue = (value: string): string | null => {
  const match = value.match(/^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/);
  return match ? match[1] : null;
};

export const formatHexString = (
  color: colorlib.Hex,
  preserveShortFormat: boolean = false,
): string => {
  const hexValue = color.to_code();

  if (preserveShortFormat) {
    if (
      hexValue[0] === hexValue[1] &&
      hexValue[2] === hexValue[3] &&
      hexValue[4] === hexValue[5]
    ) {
      return `#${hexValue[0]}${hexValue[2]}${hexValue[4]}`;
    }
  }

  return `#${color.to_code()}`;
};
