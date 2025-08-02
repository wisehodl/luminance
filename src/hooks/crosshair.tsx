import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { CartesianSpace } from "../types";
import {
  extractEventCoordinates,
  isLeftMouseButton,
  isTouchEvent,
  minmax,
} from "../util";

if (typeof TouchEvent === "undefined") {
  // @ts-ignore - intentionally creating global
  window.TouchEvent = window.MouseEvent;
}

export function useCrosshair({
  origin,
  dimensions,
  setXPosition,
  setYPosition,
}: {
  origin: CartesianSpace;
  dimensions: CartesianSpace;
  setXPosition: Dispatch<SetStateAction<number>>;
  setYPosition: Dispatch<SetStateAction<number>>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const crosshairRef = useRef<HTMLDivElement>(null);

  const originRef = useRef(origin);
  const dimensionsRef = useRef(dimensions);

  useEffect(() => {
    originRef.current = origin;
    dimensionsRef.current = dimensions;
  }, [origin, dimensions]);

  const calculatePositions = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const orig = originRef.current;
      const dims = dimensionsRef.current;

      const { clientX, clientY } = extractEventCoordinates(event);

      const xPos = minmax(clientX - orig.x, 0, dims.x - 1);
      const yPos = minmax(clientY - orig.y, 0, dims.y - 1);
      setXPosition(xPos);
      setYPosition(yPos);
    },
    [setXPosition, setYPosition],
  );

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
