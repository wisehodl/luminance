import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { CartesianSpace } from "@/types";
import {
  extractEventCoordinates,
  isLeftMouseButton,
  isTouchEvent,
  minmax,
} from "@/util";

import { useScroll } from "./scroll";

if (typeof TouchEvent === "undefined") {
  // @ts-ignore - intentionally creating global
  window.TouchEvent = window.MouseEvent;
}

export enum Direction {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
}

function chooseValueByDirection(
  direction: Direction,
  xValue: number,
  yValue: number,
) {
  return direction === Direction.HORIZONTAL ? xValue : yValue;
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
  setPosition,
}: {
  direction: Direction;
  origin: CartesianSpace;
  dimensions: CartesianSpace;
  setPosition: Dispatch<SetStateAction<number>>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const directionRef = useRef(direction);
  const originRef = useRef(origin);
  const dimensionsRef = useRef(dimensions);

  useEffect(() => {
    directionRef.current = direction;
    originRef.current = origin;
    dimensionsRef.current = dimensions;
  }, [direction, origin, dimensions]);

  // Setup drag handlers
  const calculatePosition = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const dir = directionRef.current;
      const orig = originRef.current;
      const dims = dimensionsRef.current;

      const clientCoord = extractEventCoordinateByDirection(event, dir);
      const positionValue = minmax(
        clientCoord - chooseValueByDirection(dir, orig.x, orig.y),
        0,
        chooseValueByDirection(dir, dims.x, dims.y),
      );
      setPosition(positionValue);
    },
    [setPosition],
  );

  const handleMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      calculatePosition(event);
    },
    [calculatePosition],
  );

  const handleEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
      setIsDragging(false);
    },
    [handleMove],
  );

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

    setPosition((prev: number) =>
      minmax(prev - 1, 0, chooseValueByDirection(dir, dims.x, dims.y)),
    );
  }, [setPosition]);

  const handleScrollDown = useCallback(() => {
    const dir = directionRef.current;
    const dims = dimensionsRef.current;

    setPosition((prev: number) =>
      minmax(prev + 1, 0, chooseValueByDirection(dir, dims.x, dims.y)),
    );
  }, [setPosition]);

  const { addScrollListener, removeScrollListener } = useScroll({
    targetRef: sliderRef,
    onScrollUp: handleScrollUp,
    onScrollDown: handleScrollDown,
  });

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
