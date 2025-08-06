import { useCallback, useEffect, useRef, useState } from "react";

import type { CartesianSpace, Range, Setter } from "@/types";
import { Direction } from "@/types";
import {
  chooseValueByDirection,
  extractEventCoordinates,
  isLeftMouseButton,
  isTouchEvent,
  minmax,
  positionToValue,
  valueToPosition,
} from "@/util";

import { useScroll } from "./scroll";

if (typeof TouchEvent === "undefined") {
  // @ts-ignore - intentionally creating global
  window.TouchEvent = window.MouseEvent;
}

function extractEventCoordinateByDirection(
  event: MouseEvent | TouchEvent,
  direction: Direction,
): number {
  const { clientX, clientY } = extractEventCoordinates(event);
  return chooseValueByDirection(direction, clientX, clientY);
}

export function useSlider({
  direction,
  origin,
  dimensions,
  valueRange,
  value,
  setValue,
}: {
  direction: Direction;
  origin: CartesianSpace;
  dimensions: CartesianSpace;
  valueRange: Range;
  value: number;
  setValue: Setter<number>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Slider UI refs
  const directionRef = useRef(direction);
  const originRef = useRef(origin);
  const dimensionsRef = useRef(dimensions);

  // Slider value refs
  const setValueRef = useRef(setValue);
  const valueRangeRef = useRef(valueRange);
  const maxPosition = useRef(0);

  // Internal position management
  const [position, setPosition] = useState(0);
  const positionRef = useRef(position);

  useEffect(() => {
    directionRef.current = direction;
    originRef.current = origin;
    dimensionsRef.current = dimensions;
    maxPosition.current = chooseValueByDirection(
      direction,
      dimensions.x,
      dimensions.y,
    );
  }, [direction, origin, dimensions]);

  useEffect(() => {
    valueRangeRef.current = valueRange;
  }, [valueRangeRef]);

  useEffect(() => {
    setValueRef.current = setValue;
  }, [setValue]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Setup drag handlers
  const calculatePosition = useCallback((event: MouseEvent | TouchEvent) => {
    const dir = directionRef.current;
    const orig = originRef.current;
    const dims = dimensionsRef.current;

    const clientCoord = extractEventCoordinateByDirection(event, dir);
    const newPosition = minmax(
      clientCoord - chooseValueByDirection(dir, orig.x, orig.y),
      0,
      chooseValueByDirection(dir, dims.x, dims.y),
    );
    const newValue = positionToValue(
      newPosition,
      maxPosition.current,
      valueRangeRef.current,
    );

    setValueRef.current(newValue);
  }, []);

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      calculatePosition(event);
    },
    [calculatePosition],
  );

  const handleEnd = useCallback(() => {
    document.removeEventListener("mousemove", handleMove);
    document.removeEventListener("mouseup", handleEnd);
    document.removeEventListener("touchmove", handleMove);
    document.removeEventListener("touchend", handleEnd);
    document.removeEventListener("touchcancel", handleEnd);
    setIsDragging(false);
  }, [handleMove]);

  const handleStart = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!isTouchEvent(event) && !isLeftMouseButton(event.buttons)) {
        return;
      }
      event.preventDefault();
      calculatePosition(event);
      setIsDragging(true);

      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleEnd, { passive: true });
      document.addEventListener("touchmove", handleMove);
      document.addEventListener("touchend", handleEnd, { passive: true });
      document.addEventListener("touchcancel", handleEnd, { passive: true });
    },
    [calculatePosition, handleMove, handleEnd],
  );

  // Setup scroll handlers
  const handleScrollUp = useCallback(() => {
    const dir = directionRef.current;
    const dims = dimensionsRef.current;
    const inc = chooseValueByDirection(dir, 1, -1);

    const newPosition = minmax(
      positionRef.current + inc,
      0,
      chooseValueByDirection(dir, dims.x, dims.y),
    );
    const newValue = positionToValue(
      newPosition,
      maxPosition.current,
      valueRangeRef.current,
    );
    setValueRef.current(newValue);
  }, []);

  const handleScrollDown = useCallback(() => {
    const dir = directionRef.current;
    const dims = dimensionsRef.current;
    const inc = chooseValueByDirection(dir, -1, 1);

    const newPosition = minmax(
      positionRef.current + inc,
      0,
      chooseValueByDirection(dir, dims.x, dims.y),
    );
    const newValue = positionToValue(
      newPosition,
      maxPosition.current,
      valueRangeRef.current,
    );

    setValueRef.current(newValue);
  }, []);

  const { addScrollListener, removeScrollListener } = useScroll({
    targetRef: sliderRef,
    onScrollUp: handleScrollUp,
    onScrollDown: handleScrollDown,
  });

  useEffect(() => {
    const newPosition = valueToPosition(
      value,
      maxPosition.current,
      valueRangeRef.current,
    );
    setPosition(newPosition);
  }, [value, setPosition]);

  // Set up entry listeners
  useEffect(() => {
    const currentRef = sliderRef.current;
    if (currentRef) {
      addScrollListener();
      currentRef.addEventListener("mousedown", handleStart);
      currentRef.addEventListener("touchstart", handleStart);
    }

    return () => {
      if (currentRef) {
        removeScrollListener();
        currentRef.removeEventListener("mousedown", handleStart);
        currentRef.removeEventListener("touchstart", handleStart);
      }

      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
    };
  }, [
    addScrollListener,
    removeScrollListener,
    handleStart,
    handleMove,
    handleEnd,
  ]);

  return { sliderRef, isDragging };
}
