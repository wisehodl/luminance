import { useCallback, useEffect, useRef, useState } from "react";

import type { CartesianSpace, Range, Setter } from "@/types";
import {
  extractEventCoordinates,
  isLeftMouseButton,
  isTouchEvent,
  minmax,
  positionToValue,
  valueToPosition,
} from "@/util";

if (typeof TouchEvent === "undefined") {
  // @ts-ignore - intentionally creating global
  window.TouchEvent = window.MouseEvent;
}

export function useCrosshair({
  origin,
  dimensions,
  setXPosition,
  setYPosition,
  xValue,
  yValue,
  setXValue,
  setYValue,
  xValueRange,
  yValueRange,
}: {
  origin: CartesianSpace;
  dimensions: CartesianSpace;
  setXPosition: Setter<number>;
  setYPosition: Setter<number>;
  xValue: number;
  yValue: number;
  setXValue: Setter<number>;
  setYValue: Setter<number>;
  xValueRange: Range;
  yValueRange: Range;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const crosshairRef = useRef<HTMLDivElement>(null);

  const originRef = useRef(origin);
  const dimensionsRef = useRef(dimensions);
  const setXValueRef = useRef(setXValue);
  const setYValueRef = useRef(setYValue);
  const xValueRangeRef = useRef(xValueRange);
  const yValueRangeRef = useRef(yValueRange);

  useEffect(() => {
    originRef.current = origin;
    dimensionsRef.current = dimensions;
    setXValueRef.current = setXValue;
    setYValueRef.current = setYValue;
    xValueRangeRef.current = xValueRange;
    yValueRangeRef.current = yValueRange;
  }, [origin, dimensions, setXValue, setYValue, xValueRange, yValueRange]);

  const calculatePositions = useCallback((event: MouseEvent | TouchEvent) => {
    const orig = originRef.current;
    const dims = dimensionsRef.current;

    const { clientX, clientY } = extractEventCoordinates(event);

    const xPos = minmax(clientX - orig.x, 0, dims.x - 1);
    const yPos = minmax(clientY - orig.y, 0, dims.y - 1);
    const newXValue = positionToValue(xPos, dims.x - 1, xValueRangeRef.current);
    const newYValue = positionToValue(yPos, dims.y - 1, yValueRangeRef.current);

    setXValueRef.current(newXValue);
    setYValueRef.current(newYValue);
  }, []);

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      calculatePositions(event);
    },
    [calculatePositions],
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
    const dims = dimensionsRef.current;
    const newXPos = valueToPosition(xValue, dims.x - 1, xValueRangeRef.current);
    const newYPos = valueToPosition(yValue, dims.y - 1, yValueRangeRef.current);

    if (newXPos === newXPos) setXPosition(newXPos);
    if (newYPos === newYPos) setYPosition(newYPos);
  }, [xValue, yValue, setXPosition, setYPosition]);

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
