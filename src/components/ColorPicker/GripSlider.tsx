import { useEffect, useState } from "react";

import { GripHorizontal, GripVertical } from "lucide-react";

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
  position,
  invert = false,
  parentDimensions,
}: {
  direction: Direction;
  value: number;
  setValue: Setter;
  valueRange: Range;
  position: "bottom" | "right" | "left";
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

  const isVertical = direction === Direction.VERTICAL;

  return (
    <div className={styles.gripSlider} ref={sliderRef}>
      <div
        className={styles.grip}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          top: chooseValueByDirection(
            direction,
            6,
            -17 +
              valueToPosition(
                valueRange.max - value,
                dimensions.y - 1,
                valueRange,
              ),
          ),
          left: chooseValueByDirection(
            direction,
            -16 + valueToPosition(value, dimensions.x - 1, valueRange),
            (() => {
              if (position === "right") {
                return 6;
              } else if (position === "left") {
                return -4;
              }
              return 0;
            })(),
          ),
        }}
      >
        {isVertical ? (
          <GripVertical size={24} strokeWidth={3} />
        ) : (
          <GripHorizontal size={24} strokeWidth={3} />
        )}
      </div>
    </div>
  );
}

export default GripSlider;
