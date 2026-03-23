import { useEffect, useRef, useState } from "react";

import * as colorlib from "colorlib";
import { memory } from "colorlib/colorlib_bg.wasm";

import { useSmoothAnimation } from "@/hooks/animation";
import type { HCLColorActions } from "@/hooks/color";
import { useCrosshair } from "@/hooks/crosshair";
import { useScroll } from "@/hooks/scroll";
import { onResize } from "@/hooks/window";
import type { CartesianSpace } from "@/types";
import { setMeasurements } from "@/util";

import styles from "./ColorPicker.module.css";

function ColorSquare({
  chroma,
  actions,
  parentDimensions,
}: {
  chroma: number;
  actions: HCLColorActions;
  parentDimensions: CartesianSpace;
}) {
  // State
  const [origin, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorSquareRef = useRef<colorlib.ColorSquare | null>(null);

  // Hooks
  const smoothAnimation = useSmoothAnimation();

  // Crosshair interaction
  const { crosshairRef } = useCrosshair({
    origin,
    dimensions,
    setXValue: actions.setH,
    setYValue: actions.setL,
    xValueRange: { min: 0, max: 359 },
    yValueRange: { min: 0, max: 1 },
    invertY: true,
  });

  // Handle chroma adjustment with scroll
  const { addScrollListener } = useScroll({
    targetRef: canvasRef,
    onScrollUp: () => actions.setC((prev) => Math.min(1, prev + 0.01)),
    onScrollDown: () => actions.setC((prev) => Math.max(0, prev - 0.01)),
  });

  // Update canvas when chroma changes
  useEffect(() => {
    const square = colorSquareRef.current;
    if (square && canvasRef.current) {
      smoothAnimation(() => {
        square.fill_chroma(chroma);
        refreshColorSquare(canvasRef.current!, square);
      });
    }
  }, [chroma]);

  // Add event listeners
  useEffect(() => {
    if (canvasRef.current) addScrollListener();
  }, [addScrollListener]);

  // Get measurements
  useEffect(() => {
    if (containerRef.current) {
      setMeasurements(containerRef, setOrigin, setDimensions);
    }

    return onResize(() =>
      setMeasurements(containerRef, setOrigin, setDimensions),
    );
  }, [parentDimensions]);

  // Resize square
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || parentDimensions.x <= 0)
      return;

    colorSquareRef.current?.free();

    const newSize = parentDimensions.x - 54;
    const square = new colorlib.ColorSquare(newSize);
    colorSquareRef.current = square;

    smoothAnimation(() => {
      if (canvasRef.current) {
        square.fill_chroma(chroma);
        refreshColorSquare(canvasRef.current, square);
      }
    });
  }, [containerRef, canvasRef, parentDimensions]);

  // free on unmount
  useEffect(() => {
    return () => {
      colorSquareRef.current?.free();
      colorSquareRef.current = null;
    };
  }, []);

  return (
    <div className={styles.colorSquareWrapper} ref={containerRef}>
      <div
        className={styles.colorSquare}
        ref={crosshairRef}
        style={{
          width: colorSquareRef.current?.get_size(),
          height: colorSquareRef.current?.get_size(),
        }}
      >
        <canvas
          ref={canvasRef}
          width={colorSquareRef.current?.get_size()}
          height={colorSquareRef.current?.get_size()}
        />
      </div>
    </div>
  );
}

function refreshColorSquare(
  canvas: HTMLCanvasElement,
  colorSquare: colorlib.ColorSquare,
) {
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const size = colorSquare.get_size();
    const imageData = ctx.createImageData(size, size);
    const pixelPointer = colorSquare.get_pixels_pointer();
    const pixels = new Uint8Array(memory.buffer, pixelPointer, size * size * 4);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  }
}

export default ColorSquare;
