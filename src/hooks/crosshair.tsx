import { useEffect, useState, useRef } from "react";
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

  // Construct event handler refs
  // Prevents unnecessary function recreation
  const calculatePositionsRef = useRef((_: MouseEvent | TouchEvent) => {});
  const startCrosshairInteractionRef = useRef(
    (_: MouseEvent | TouchEvent) => {},
  );
  const processCrosshairInteractionRef = useRef(
    (_: MouseEvent | TouchEvent) => {},
  );
  const endCrosshairInteractionRef = useRef((_: MouseEvent | TouchEvent) => {});

  // Store dependencies as refs
  // Always use latest values
  const originRef = useRef(origin);
  const dimensionsRef = useRef(dimensions);

  useEffect(() => {
    originRef.current = origin;
    dimensionsRef.current = dimensions;
  }, [origin, dimensions]);

  // Update handler functions when dependencies change via reference

  useEffect(() => {
    calculatePositionsRef.current = (event: MouseEvent | TouchEvent) => {
      const orig = originRef.current;
      const dims = dimensionsRef.current;

      const clientX = isTouchEvent(event)
        ? event.touches[0].clientX
        : event.clientX;
      const clientY = isTouchEvent(event)
        ? event.touches[0].clientY
        : event.clientY;

      const xPos = minmax(clientX - orig.x, 0, dims.x - 1);
      const yPos = minmax(clientY - orig.y, 0, dims.y - 1);
      setXPosition(xPos);
      setYPosition(yPos);
    };

    startCrosshairInteractionRef.current = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      calculatePositionsRef.current(event);
      setIsDragging(true);

      if (!isTouchEvent(event)) {
        document.addEventListener(
          "mousemove",
          processCrosshairInteractionRef.current,
        );
        document.addEventListener(
          "mouseup",
          endCrosshairInteractionRef.current,
          { passive: true },
        );
      } else {
        document.addEventListener(
          "touchmove",
          processCrosshairInteractionRef.current,
        );
        document.addEventListener(
          "touchend",
          endCrosshairInteractionRef.current,
          { passive: true },
        );
        document.addEventListener(
          "touchcancel",
          endCrosshairInteractionRef.current,
          { passive: true },
        );
      }
    };

    processCrosshairInteractionRef.current = (
      event: MouseEvent | TouchEvent,
    ) => {
      event.preventDefault();
      calculatePositionsRef.current(event);
    };

    endCrosshairInteractionRef.current = (event: MouseEvent | TouchEvent) => {
      setIsDragging(false);
      if (!isTouchEvent(event)) {
        document.removeEventListener(
          "mousemove",
          processCrosshairInteractionRef.current,
        );
        document.removeEventListener(
          "mouseup",
          endCrosshairInteractionRef.current,
        );
      } else {
        document.removeEventListener(
          "touchmove",
          processCrosshairInteractionRef.current,
        );
        document.removeEventListener(
          "touchend",
          endCrosshairInteractionRef.current,
        );
        document.removeEventListener(
          "touchcancel",
          endCrosshairInteractionRef.current,
        );
      }
    };
  }, []);

  // Set up entry listeners
  useEffect(() => {
    const currentRef = crosshairRef.current;
    if (currentRef) {
      currentRef.addEventListener(
        "mousedown",
        startCrosshairInteractionRef.current,
      );
      currentRef.addEventListener(
        "touchstart",
        startCrosshairInteractionRef.current,
      );
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener(
          "mousedown",
          startCrosshairInteractionRef.current,
        );
        currentRef.removeEventListener(
          "touchstart",
          startCrosshairInteractionRef.current,
        );
      }
    };
  }, []);

  return { crosshairRef, isDragging };
}
