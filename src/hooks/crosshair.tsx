import { useCallback, useEffect, useRef, useState } from "react";

import type { CartesianSpace, Range, Setter } from "@/types";
import {
  extractEventCoordinates,
  isLeftMouseButton,
  isTouchEvent,
  minmax,
  positionToValue,
} from "@/util";

import { useSmoothAnimation } from "./animation";

if (typeof TouchEvent === "undefined") {
  // @ts-expect-error - intentionally creating global
  window.TouchEvent = window.MouseEvent;
}

export function useCrosshair({
  origin,
  dimensions,
  setXValue,
  setYValue,
  xValueRange,
  yValueRange,
  invertX,
  invertY,
}: {
  origin: CartesianSpace;
  dimensions: CartesianSpace;
  setXValue: Setter<number>;
  setYValue: Setter<number>;
  xValueRange: Range;
  yValueRange: Range;
  invertX?: boolean;
  invertY?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const crosshairRef = useRef<HTMLDivElement>(null);

  // Crosshair UI refs
  const originRef = useRef(origin);
  const dimensionsRef = useRef(dimensions);

  // Crosshair value refs
  const setXValueRef = useRef(setXValue);
  const setYValueRef = useRef(setYValue);
  const xValueRangeRef = useRef(xValueRange);
  const yValueRangeRef = useRef(yValueRange);

  // Hooks
  const smoothAnimation = useSmoothAnimation();

  useEffect(() => {
    originRef.current = origin;
    dimensionsRef.current = dimensions;
  }, [origin, dimensions]);

  useEffect(() => {
    xValueRangeRef.current = xValueRange;
    yValueRangeRef.current = yValueRange;
  }, [xValueRange, yValueRange]);

  const calculatePositions = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const orig = originRef.current;
      const dims = dimensionsRef.current;
      const xRange = xValueRangeRef.current;
      const yRange = yValueRangeRef.current;

      const { clientX, clientY } = extractEventCoordinates(event);

      const xPos = minmax(clientX - orig.x, 0, dims.x - 1);
      const yPos = minmax(clientY - orig.y, 0, dims.y - 1);
      let newXValue = positionToValue(xPos, dims.x - 1, xRange);
      let newYValue = positionToValue(yPos, dims.y - 1, yRange);

      if (invertX) {
        newXValue = xRange.max - newXValue;
      }

      if (invertY) {
        newYValue = yRange.max - newYValue;
      }

      setXValueRef.current(newXValue);
      setYValueRef.current(newYValue);
    },
    [invertX, invertY],
  );

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      smoothAnimation(() => calculatePositions(event));
    },
    [calculatePositions, smoothAnimation],
  );

  const handleEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      setIsDragging(false);
      if (!isTouchEvent(event)) {
        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);
      } else {
        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);
        document.removeEventListener("touchcancel", handleEnd);
      }
    },
    [handleMove],
  );

  const handleStart = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isTouchEvent(event) && !isLeftMouseButton(event.buttons)) {
        return;
      }
      event.preventDefault();
      calculatePositions(event);
      setIsDragging(true);

      if (!isTouchEvent(event)) {
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleEnd, {
          passive: true,
        });
      } else {
        document.addEventListener("touchmove", handleMove);
        document.addEventListener("touchend", handleEnd, {
          passive: true,
        });
        document.addEventListener("touchcancel", handleEnd, {
          passive: true,
        });
      }
    },
    [calculatePositions, handleMove, handleEnd],
  );

  useEffect(() => {
    const currentRef = crosshairRef.current;
    if (currentRef) {
      currentRef.addEventListener("mousedown", handleStart);
      currentRef.addEventListener("touchstart", handleStart);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("mousedown", handleStart);
        currentRef.removeEventListener("touchstart", handleStart);
      }

      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
    };
  }, [handleStart, handleMove, handleEnd]);

  return { crosshairRef, isDragging };
}
