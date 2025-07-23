import { useState, useRef, useEffect } from "react";
import type { Dispatch, SetStateAction, RefObject } from "react";
import { minmax } from "../util";
import type { CartesianSpace } from "../types";
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
}): { sliderRef: RefObject<HTMLDivElement | null>; isDragging: boolean } {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Construct event handler refs
  // Prevents unnecessary function recreation
  const calculatePositionRef = useRef((_: MouseEvent | TouchEvent) => {});
  const startSliderInteractionRef = useRef((_: MouseEvent | TouchEvent) => {});
  const processSliderInteractionRef = useRef(
    (_: MouseEvent | TouchEvent) => {},
  );
  const endSliderInteractionRef = useRef((_: MouseEvent | TouchEvent) => {});

  // Store dependencies as refs
  // Always use latest values
  const directionRef = useRef(direction);
  const originRef = useRef(origin);
  const dimensionsRef = useRef(dimensions);

  useEffect(() => {
    directionRef.current = direction;
    originRef.current = origin;
    dimensionsRef.current = dimensions;
  }, [direction, origin, dimensions]);

  // Setup scroll handlers
  const handleScrollUp = () => {
    const dir = directionRef.current;
    const dims = dimensionsRef.current;

    setPosition((prev: number) =>
      minmax(prev - 1, 0, chooseValueByDirection(dir, dims.x, dims.y)),
    );
  };

  const handleScrollDown = () => {
    const dir = directionRef.current;
    const dims = dimensionsRef.current;

    setPosition((prev: number) =>
      minmax(prev + 1, 0, chooseValueByDirection(dir, dims.x, dims.y)),
    );
  };

  // Initialize scroll handling
  const { addScrollListener, removeScrollListener } = useScroll({
    targetRef: sliderRef,
    onScrollUp: handleScrollUp,
    onScrollDown: handleScrollDown,
  });

  // Update handler functions when dependencies change via reference
  useEffect(() => {
    calculatePositionRef.current = (event: MouseEvent | TouchEvent) => {
      const dir = directionRef.current;
      const orig = originRef.current;
      const dims = dimensionsRef.current;

      const clientCoord = isTouchEvent(event)
        ? chooseValueByDirection(
            dir,
            event.touches[0].clientX,
            event.touches[0].clientY,
          )
        : chooseValueByDirection(dir, event.clientX, event.clientY);
      const positionValue = minmax(
        clientCoord - chooseValueByDirection(dir, orig.x, orig.y),
        0,
        chooseValueByDirection(dir, dims.x, dims.y),
      );
      setPosition(positionValue);
    };

    startSliderInteractionRef.current = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      calculatePositionRef.current(event);
      setIsDragging(true);

      if (!isTouchEvent(event)) {
        document.addEventListener(
          "mousemove",
          processSliderInteractionRef.current,
        );
        document.addEventListener("mouseup", endSliderInteractionRef.current, {
          passive: true,
        });
      } else {
        document.addEventListener(
          "touchmove",
          processSliderInteractionRef.current,
        );
        document.addEventListener("touchend", endSliderInteractionRef.current, {
          passive: true,
        });
        document.addEventListener(
          "touchcancel",
          endSliderInteractionRef.current,
          {
            passive: true,
          },
        );
      }
    };

    processSliderInteractionRef.current = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      calculatePositionRef.current(event);
    };

    endSliderInteractionRef.current = (event: MouseEvent | TouchEvent) => {
      setIsDragging(false);
      if (!isTouchEvent(event)) {
        document.removeEventListener(
          "mousemove",
          processSliderInteractionRef.current,
        );
        document.removeEventListener(
          "mouseup",
          endSliderInteractionRef.current,
        );
      } else {
        document.removeEventListener(
          "touchmove",
          processSliderInteractionRef.current,
        );
        document.removeEventListener(
          "touchend",
          endSliderInteractionRef.current,
        );
        document.removeEventListener(
          "touchcancel",
          endSliderInteractionRef.current,
        );
      }
    };
  }, []);

  // Set up entry listeners
  useEffect(() => {
    const currentRef = sliderRef.current;
    if (currentRef) {
      addScrollListener();
      currentRef.addEventListener(
        "mousedown",
        startSliderInteractionRef.current,
      );
      currentRef.addEventListener(
        "touchstart",
        startSliderInteractionRef.current,
      );
    }

    return () => {
      if (currentRef) {
        removeScrollListener();
        currentRef.removeEventListener(
          "mousedown",
          startSliderInteractionRef.current,
        );
        currentRef.removeEventListener(
          "touchstart",
          startSliderInteractionRef.current,
        );
      }
    };
  }, []);

  return { sliderRef, isDragging };
}
