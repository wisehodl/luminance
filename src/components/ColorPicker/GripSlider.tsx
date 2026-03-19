import { useEffect, useState } from "react";

import type { Setter } from "@/hooks/color";
import { useSlider } from "@/hooks/slider";
import { onResize } from "@/hooks/window";
import { Direction } from "@/types";
import type { CartesianSpace, Range } from "@/types";
import {
  chooseValueByDirection,
  setMeasurements,
  valueToPosition,
} from "@/util";

import styles from "./ColorPicker.module.css";

function GripSlider({
  direction,
  value,
  setValue,
  valueRange,
  arrowDirection,
  invert = false,
  parentDimensions,
}: {
  direction: Direction;
  value: number;
  setValue: Setter;
  valueRange: Range;
  arrowDirection: "up" | "left" | "right";
  invert?: boolean;
  parentDimensions: CartesianSpace;
}) {
  const [origin, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });

  // Slider interaction
  const { sliderRef, isDragging } = useSlider({
    direction,
    origin,
    dimensions,
    valueRange,
    value,
    setValue,
    invert,
  });

  useEffect(() => {
    if (sliderRef.current) {
      setMeasurements(sliderRef, setOrigin, setDimensions);
    }

    return onResize(() => setMeasurements(sliderRef, setOrigin, setDimensions));
  }, [sliderRef, parentDimensions]);

  const upArrowStyle = {
    borderLeft: "12px solid transparent",
    borderRight: "12px solid transparent",
    borderBottom: "25px solid black",
  };

  const leftArrowStyle = {
    borderTop: "12px solid transparent",
    borderBottom: "12px solid transparent",
    borderRight: "25px solid black",
  };

  const rightArrowStyle = {
    borderTop: "12px solid transparent",
    borderBottom: "12px solid transparent",
    borderLeft: "25px solid black",
  };

  const arrowStyle = (function () {
    switch (arrowDirection) {
      case "up":
        return upArrowStyle;
      case "left":
        return leftArrowStyle;
      case "right":
        return rightArrowStyle;
      default:
        return {};
    }
  })();

  return (
    <div className={styles.gripSlider} ref={sliderRef}>
      <div
        className={styles.grip}
        style={{
          ...arrowStyle,
          cursor: isDragging ? "grabbing" : "grab",
          top: chooseValueByDirection(
            direction,
            0,
            -12 +
              valueToPosition(
                valueRange.max - value,
                dimensions.y - 1,
                valueRange,
              ),
          ),
          left: chooseValueByDirection(
            direction,
            -12 + valueToPosition(value, dimensions.x - 1, valueRange),
            0,
          ),
        }}
      />
    </div>
  );
}

export default GripSlider;
