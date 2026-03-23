import { useEffect, useRef, useState } from "react";

import * as colorlib from "colorlib";

import type { ColorActions } from "@/hooks/color";
import { onResize } from "@/hooks/window";
import { Direction } from "@/types";
import type { CartesianSpace } from "@/types";
import { formatCssRgb, setMeasurements } from "@/util";

import ColorBar from "./ColorBar";
import styles from "./ColorPicker.module.css";
import ColorSquare from "./ColorSquare";
import { BarCrosshair, SquareCrosshair } from "./Crosshair";
import GripSlider from "./GripSlider";

function ColorPicker({
  color,
  actions,
}: {
  color: colorlib.Color;
  actions: ColorActions;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hueRange = { min: 0, max: 359 };
  const lumRange = { min: 0, max: 1 };

  const [, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });

  // Get measurements
  useEffect(() => {
    if (containerRef.current) {
      setMeasurements(containerRef, setOrigin, setDimensions);
    }

    return onResize(() => {
      setMeasurements(containerRef, setOrigin, setDimensions);
    });
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      {/* <div */}
      {/*   className={styles.preview} */}
      {/*   style={{ */}
      {/*     backgroundColor: formatCssRgb(color.hex), */}
      {/*   }} */}
      {/* ></div> */}
      <div className={styles.verticalGripLeft}>
        <GripSlider
          direction={Direction.VERTICAL}
          value={color.hcl.l}
          setValue={actions.hcl.setL}
          valueRange={lumRange}
          position="left"
          invert={true}
          parentDimensions={dimensions}
        />
      </div>
      <div className={styles.pickerSquare}>
        <SquareCrosshair
          hue={color.hcl.h}
          luminance={color.hcl.l}
          hex={color.hex}
          parentDimensions={dimensions}
        />
        <ColorSquare
          chroma={color.hcl.c}
          actions={actions.hcl}
          parentDimensions={dimensions}
        />
      </div>
      <div className={styles.verticalGripRight}>
        <GripSlider
          direction={Direction.VERTICAL}
          value={color.hcl.l}
          setValue={actions.hcl.setL}
          valueRange={lumRange}
          position="right"
          invert={true}
          parentDimensions={dimensions}
        />
      </div>
      <div className={styles.horizontalGrip}>
        <GripSlider
          direction={Direction.HORIZONTAL}
          value={color.hcl.h}
          setValue={actions.hcl.setH}
          valueRange={hueRange}
          position="bottom"
          parentDimensions={dimensions}
        />
      </div>
      <div className={styles.pickerBar}>
        <ColorBar
          hue={color.hcl.h}
          chroma={color.hcl.c}
          luminance={color.hcl.l}
          setChroma={actions.hcl.setC}
          parentDimensions={dimensions}
        />
        <BarCrosshair
          chroma={color.hcl.c}
          luminance={color.hcl.l}
          hex={color.hex}
          parentDimensions={dimensions}
        />
      </div>
    </div>
  );
}

export default ColorPicker;
