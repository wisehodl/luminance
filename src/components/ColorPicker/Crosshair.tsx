import { useEffect, useRef, useState } from "react";

import * as colorlib from "colorlib";

import { useResize } from "@/hooks/window";
import type { CartesianSpace } from "@/types";
import { formatCssRgb, setMeasurements, valueToPosition } from "@/util";

import styles from "./ColorPicker.module.css";

export function SquareCrosshair({
  hue,
  luminance,
  hex,
  parentDimensions,
  isDragging,
}: {
  hue: number;
  luminance: number;
  hex: colorlib.Hex;
  parentDimensions: CartesianSpace;
  isDragging: boolean;
}) {
  const [_origin, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [darkCrosshairs, setDarkCrosshairs] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lumRange = { min: 0, max: 1 };
  const hueRange = { min: 0, max: 359 };

  useEffect(() => {
    setDarkCrosshairs(luminance > 0.5);
  }, [luminance]);

  useEffect(() => {
    setMeasurements(containerRef, setOrigin, setDimensions);
    return useResize(() =>
      setMeasurements(containerRef, setOrigin, setDimensions),
    );
  }, [containerRef.current, parentDimensions]);

  return (
    <div className={styles.crosshairWrapper} ref={containerRef}>
      <div
        className={styles.crosshair}
        style={{
          width: 1,
          height: dimensions.y,
          backgroundColor: darkCrosshairs ? "black" : "white",
          boxShadow: darkCrosshairs ? "0 0 2px black" : "0 0 2px white",
          left: valueToPosition(hue, dimensions.x - 1, hueRange),
          top: 0,
        }}
      ></div>
      <div
        className={styles.crosshair}
        style={{
          width: dimensions.x,
          height: 1,
          backgroundColor: darkCrosshairs ? "black" : "white",
          boxShadow: darkCrosshairs ? "0 0 2px black" : "0 0 2px white",
          left: 0,
          top: valueToPosition(1 - luminance, dimensions.y - 1, lumRange),
        }}
      ></div>
      <div
        className={styles.crossEye}
        style={{
          borderColor: darkCrosshairs ? "black" : "white",
          boxShadow: darkCrosshairs ? "0 0 1px black" : "0 0 1px white",
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
  const [_origin, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [darkCrosshairs, setDarkCrosshairs] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const chromaRange = { min: 0, max: 1 };

  useEffect(() => {
    setDarkCrosshairs(luminance > 0.5);
  }, [luminance]);

  useEffect(() => {
    setMeasurements(containerRef, setOrigin, setDimensions);
    return useResize(() =>
      setMeasurements(containerRef, setOrigin, setDimensions),
    );
  }, [containerRef.current, parentDimensions]);

  return (
    <div className={styles.crosshairWrapper} ref={containerRef}>
      <div
        className={styles.crosshair}
        style={{
          width: 1,
          height: dimensions.y,
          backgroundColor: darkCrosshairs ? "black" : "white",
          boxShadow: darkCrosshairs ? "0 0 2px black" : "0 0 2px white",
          left: valueToPosition(chroma, dimensions.x - 1, chromaRange),
          top: 0,
        }}
      ></div>
      <div
        className={styles.crossEye}
        style={{
          borderColor: darkCrosshairs ? "black" : "white",
          boxShadow: darkCrosshairs ? "0 0 1px black" : "0 0 1px white",
          backgroundColor: formatCssRgb(hex),
          top: 6,
          left: valueToPosition(chroma, dimensions.x - 1, chromaRange) - 6,
        }}
      ></div>
    </div>
  );
}
