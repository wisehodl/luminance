import { useEffect, useRef, useState } from "react";

import * as colorlib from "colorlib";

import { useContrastToken } from "@/hooks/contrast";
import { onResize } from "@/hooks/window";
import type { CartesianSpace } from "@/types";
import { formatCssRgb, setMeasurements, valueToPosition } from "@/util";

import styles from "./ColorPicker.module.css";

export function SquareCrosshair({
  hue,
  luminance,
  hex,
  parentDimensions,
}: {
  hue: number;
  luminance: number;
  hex: colorlib.Hex;
  parentDimensions: CartesianSpace;
}) {
  const [, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });
  const crosshairColor = { dark: "black", light: "white" };
  const token = useContrastToken(() => luminance);
  const containerRef = useRef<HTMLDivElement>(null);
  const lumRange = { min: 0, max: 1 };
  const hueRange = { min: 0, max: 359 };

  useEffect(() => {
    setMeasurements(containerRef, setOrigin, setDimensions);
    return onResize(() =>
      setMeasurements(containerRef, setOrigin, setDimensions),
    );
  }, [containerRef, parentDimensions]);

  return (
    <div className={styles.crosshairWrapper} ref={containerRef}>
      <div
        className={styles.crosshair}
        style={{
          width: 1,
          height: dimensions.y,
          backgroundColor: crosshairColor[token],
          boxShadow: `0 0 2px ${crosshairColor[token]}`,
          left: valueToPosition(hue, dimensions.x - 1, hueRange),
          top: 0,
        }}
      ></div>
      <div
        className={styles.crosshair}
        style={{
          width: dimensions.x,
          height: 1,
          backgroundColor: crosshairColor[token],
          boxShadow: `0 0 2px ${crosshairColor[token]}`,
          left: 0,
          top: valueToPosition(1 - luminance, dimensions.y - 1, lumRange),
        }}
      ></div>
      <div
        className={styles.crossEye}
        style={{
          borderColor: crosshairColor[token],
          boxShadow: `0 0 1px ${crosshairColor[token]}`,
          backgroundColor: formatCssRgb(hex),
          top: valueToPosition(1 - luminance, dimensions.y - 1, lumRange) - 6,
          left: valueToPosition(hue, dimensions.x - 1, hueRange) - 6,
        }}
      ></div>
    </div>
  );
}

export function BarCrosshair({
  chroma,
  luminance,
  hex,
  parentDimensions,
}: {
  chroma: number;
  luminance: number;
  hex: colorlib.Hex;
  parentDimensions: CartesianSpace;
}) {
  const [, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });
  const crosshairColor = { dark: "black", light: "white" };
  const token = useContrastToken(() => luminance);
  const containerRef = useRef<HTMLDivElement>(null);
  const chromaRange = { min: 0, max: 1 };

  useEffect(() => {
    setMeasurements(containerRef, setOrigin, setDimensions);
    return onResize(() =>
      setMeasurements(containerRef, setOrigin, setDimensions),
    );
  }, [containerRef, parentDimensions]);

  return (
    <div className={styles.crosshairWrapper} ref={containerRef}>
      <div
        className={styles.crosshair}
        style={{
          width: 1,
          height: dimensions.y,
          backgroundColor: crosshairColor[token],
          boxShadow: `0 0 2px ${crosshairColor[token]}`,
          left: valueToPosition(chroma, dimensions.x - 1, chromaRange),
          top: 0,
        }}
      ></div>
      <div
        className={styles.crossEye}
        style={{
          borderColor: crosshairColor[token],
          boxShadow: `0 0 1px ${crosshairColor[token]}`,
          backgroundColor: formatCssRgb(hex),
          top: 6,
          left: valueToPosition(chroma, dimensions.x - 1, chromaRange) - 6,
        }}
      ></div>
    </div>
  );
}
