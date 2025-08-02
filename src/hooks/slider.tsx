import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { CartesianSpace } from "../types";
import {
  extractEventCoordinates,
  isLeftMouseButton,
  isTouchEvent,
  minmax,
} from "../util";
import { useScroll } from "./scroll";

if (typeof TouchEvent === "undefined") {
  // @ts-ignore - intentionally creating global
  window.TouchEvent = window.MouseEvent;
}

function isTouchEvent(event: Event): event is TouchEvent {
  return "touches" in event;
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

function extractEventCoordinate(
  event: MouseEvent | TouchEvent,
  direction: Direction,
): number {
  if (isTouchEvent(event)) {
    return chooseValueByDirection(
      direction,
      event.touches[0].clientX,
      event.touches[0].clientY,
    );
  }
  return chooseValueByDirection(direction, event.clientX, event.clientY);
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

      const clientCoord = extractEventCoordinate(event, dir);
      const positionValue = minmax(
        clientCoord - chooseValueByDirection(dir, orig.x, orig.y),
        0,
        chooseValueByDirection(dir, dims.x, dims.y),
      );
      setPosition(positionValue);
    },
    [setPosition],
  );

  const processSliderInteraction = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      calculatePosition(event);
    },
    [calculatePosition],
  );

  const endSliderInteraction = useCallback(
    (event: MouseEvent | TouchEvent) => {
      setIsDragging(false);
      if (!isTouchEvent(event)) {
        document.removeEventListener("mousemove", processSliderInteraction);
        document.removeEventListener("mouseup", endSliderInteraction);
      } else {
        document.removeEventListener("touchmove", processSliderInteraction);
        document.removeEventListener("touchend", endSliderInteraction);
        document.removeEventListener("touchcancel", endSliderInteraction);
      }
    },
    [processSliderInteraction],
  );

  const startSliderInteraction = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      calculatePosition(event);
      setIsDragging(true);

      if (!isTouchEvent(event)) {
        document.addEventListener("mousemove", processSliderInteraction);
        document.addEventListener("mouseup", endSliderInteraction, {
          passive: true,
        });
      } else {
        document.addEventListener("touchmove", processSliderInteraction);
        document.addEventListener("touchend", endSliderInteraction, {
          passive: true,
        });
        document.addEventListener("touchcancel", endSliderInteraction, {
          passive: true,
        });
      }
    },
    [calculatePosition, processSliderInteraction, endSliderInteraction],
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
      currentRef.addEventListener("mousedown", startSliderInteraction);
      currentRef.addEventListener("touchstart", startSliderInteraction);
    }

    return () => {
      if (currentRef) {
        removeScrollListener();
        currentRef.removeEventListener("mousedown", startSliderInteraction);
        currentRef.removeEventListener("touchstart", startSliderInteraction);
      }

      document.removeEventListener("mousemove", processSliderInteraction);
      document.removeEventListener("mouseup", endSliderInteraction);
      document.removeEventListener("touchmove", processSliderInteraction);
      document.removeEventListener("touchend", endSliderInteraction);
      document.removeEventListener("touchcancel", endSliderInteraction);
    };
  }, [
    addScrollListener,
    removeScrollListener,
    startSliderInteraction,
    processSliderInteraction,
    endSliderInteraction,
  ]);

  return { sliderRef, isDragging };
}
