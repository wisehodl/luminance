import { useEffect, useRef, useState } from "react";

import * as colorlib from "colorlib";
import { memory } from "colorlib/colorlib_bg.wasm";

import { useSmoothAnimation } from "@/hooks/animation";
import type { Setter } from "@/hooks/color";
import { useSlider } from "@/hooks/slider";
import { onResize } from "@/hooks/window";
import type { CartesianSpace } from "@/types";
import { Direction } from "@/types";
import { setMeasurements } from "@/util";

import styles from "./ColorPicker.module.css";

function ColorBar({
  hue,
  chroma,
  luminance,
  setChroma,
  parentDimensions,
}: {
  hue: number;
  chroma: number;
  luminance: number;
  setChroma: Setter;
  parentDimensions: CartesianSpace;
}) {
  // State
  const [colorBar, setColorBar] = useState<colorlib.ColorBar | null>(null);
  const [origin, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Hooks
  const smoothAnimation = useSmoothAnimation();

  // Slider interaction
  const { sliderRef } = useSlider({
    direction: Direction.HORIZONTAL,
    origin,
    dimensions,
    valueRange: { min: 0, max: 1 },
    value: chroma,
    setValue: setChroma,
  });

  // Update canvas when hue/luminance changes
  useEffect(() => {
    if (colorBar && canvasRef.current) {
      smoothAnimation(() => {
        colorBar.fill_color(hue, luminance);
        refreshColorBar(canvasRef.current!, colorBar);
      });
    }
  }, [hue, luminance, colorBar, smoothAnimation]);

  // Get measurements
  useEffect(() => {
    if (containerRef.current) {
      setMeasurements(containerRef, setOrigin, setDimensions);
    }

    return onResize(() =>
      setMeasurements(containerRef, setOrigin, setDimensions),
    );
  }, [containerRef]);

  // Resize color bar
  useEffect(() => {
    if (containerRef.current && canvasRef.current && parentDimensions.x > 0) {
      const newHeight = containerRef.current.clientHeight;
      const newWidth = parentDimensions.x - 54;
      const newColorBar = new colorlib.ColorBar(newWidth, newHeight);

      setColorBar(newColorBar);

      if (newColorBar) {
        smoothAnimation(() => {
          if (canvasRef.current) {
            newColorBar.fill_color(hue, luminance);
            refreshColorBar(canvasRef.current!, newColorBar);
          }
        });
      }
    }
  }, [
    containerRef,
    canvasRef,
    parentDimensions,
    hue,
    luminance,
    smoothAnimation,
  ]);

  return (
    <div className={styles.colorBarWrapper} ref={containerRef}>
      <div
        className={styles.colorBar}
        ref={sliderRef}
        style={{
          width: colorBar?.get_width(),
          height: colorBar?.get_height(),
        }}
      >
        <canvas
          ref={canvasRef}
          width={colorBar?.get_width()}
          height={colorBar?.get_height()}
        />
      </div>
    </div>
  );
}

function refreshColorBar(
  canvas: HTMLCanvasElement,
  colorBar: colorlib.ColorBar,
) {
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const width = colorBar.get_width();
    const height = colorBar.get_height();
    const imageData = ctx.createImageData(width, height);
    const pixelPointer = colorBar.get_pixels_pointer();
    const pixels = new Uint8Array(
      memory.buffer,
      pixelPointer,
      width * height * 4,
    );

    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  }
}

export default ColorBar;
