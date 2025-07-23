import { useEffect, useState, useRef, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CartesianSpace } from "../types";
import { minmax } from "../util";

if (typeof TouchEvent === "undefined") {
  // @ts-ignore - intentionally creating global
  window.TouchEvent = window.MouseEvent;
}

function isTouchEvent(event: Event): event is TouchEvent {
  return "touches" in event;
}

function extractEventCoordinates(event: MouseEvent | TouchEvent): {
  clientX: number;
  clientY: number;
} {
  if (isTouchEvent(event)) {
    return {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY,
    };
  }
  return {
    clientX: event.clientX,
    clientY: event.clientY,
  };
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

  const processCrosshairInteraction = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      calculatePositions(event);
    },
    [calculatePositions],
  );

  const endCrosshairInteraction = useCallback(
    (event: MouseEvent | TouchEvent) => {
      setIsDragging(false);
      if (!isTouchEvent(event)) {
        document.removeEventListener("mousemove", processCrosshairInteraction);
        document.removeEventListener("mouseup", endCrosshairInteraction);
      } else {
        document.removeEventListener("touchmove", processCrosshairInteraction);
        document.removeEventListener("touchend", endCrosshairInteraction);
        document.removeEventListener("touchcancel", endCrosshairInteraction);
      }
    },
    [processCrosshairInteraction],
  );

  const startCrosshairInteraction = useCallback(
    (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      calculatePositions(event);
      setIsDragging(true);

      if (!isTouchEvent(event)) {
        document.addEventListener("mousemove", processCrosshairInteraction);
        document.addEventListener("mouseup", endCrosshairInteraction, {
          passive: true,
        });
      } else {
        document.addEventListener("touchmove", processCrosshairInteraction);
        document.addEventListener("touchend", endCrosshairInteraction, {
          passive: true,
        });
        document.addEventListener("touchcancel", endCrosshairInteraction, {
          passive: true,
        });
      }
    },
    [calculatePositions, processCrosshairInteraction, endCrosshairInteraction],
  );

  useEffect(() => {
    const currentRef = crosshairRef.current;
    if (currentRef) {
      currentRef.addEventListener("mousedown", startCrosshairInteraction);
      currentRef.addEventListener("touchstart", startCrosshairInteraction);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("mousedown", startCrosshairInteraction);
        currentRef.removeEventListener("touchstart", startCrosshairInteraction);
      }

      document.removeEventListener("mousemove", processCrosshairInteraction);
      document.removeEventListener("mouseup", endCrosshairInteraction);
      document.removeEventListener("touchmove", processCrosshairInteraction);
      document.removeEventListener("touchend", endCrosshairInteraction);
      document.removeEventListener("touchcancel", endCrosshairInteraction);
    };
  }, [
    startCrosshairInteraction,
    processCrosshairInteraction,
    endCrosshairInteraction,
  ]);

  return { crosshairRef, isDragging };
}
