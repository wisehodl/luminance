import { useState, useRef, useEffect } from "react";
import type { Dispatch, SetStateAction, RefObject } from "react";
import { minmax } from "../util";
import type { CartesianSpace } from "../types";
import { handleScroll } from "./scroll";

export enum Direction {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical",
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
  const [_, setScrollLength] = useState(0);

  function calculatePosition(event: MouseEvent | TouchEvent) {
    const clientCoord =
      event instanceof TouchEvent
        ? direction === Direction.HORIZONTAL
          ? event.touches[0].clientX
          : event.touches[0].clientY
        : direction === Direction.HORIZONTAL
          ? event.clientX
          : event.clientY;
    const positionValue = minmax(
      clientCoord - (direction === Direction.HORIZONTAL ? origin.x : origin.y),
      0,
      direction === Direction.HORIZONTAL ? dimensions.x : dimensions.y,
    );
    setPosition(positionValue);
  }

  function startSliderInteraction(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    calculatePosition(event);
    setIsDragging(true);
    if (event instanceof MouseEvent) {
      document.addEventListener("mousemove", processSliderInteraction);
      document.addEventListener("mouseup", endSliderInteraction);
    } else {
      document.addEventListener("touchmove", processSliderInteraction);
      document.addEventListener("touchend", endSliderInteraction);
      document.addEventListener("touchcancel", endSliderInteraction);
    }
  }

  function processSliderInteraction(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    calculatePosition(event);
  }

  function endSliderInteraction(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    setIsDragging(false);
    if (event instanceof MouseEvent) {
      document.removeEventListener("mousemove", processSliderInteraction);
      document.removeEventListener("mouseup", endSliderInteraction);
    } else {
      document.removeEventListener("touchmove", processSliderInteraction);
      document.removeEventListener("touchend", endSliderInteraction);
      document.removeEventListener("touchcancel", endSliderInteraction);
    }
  }

  function adjustPositionWithScroll(event: WheelEvent) {
    event.preventDefault();
    setScrollLength((prev) =>
      handleScroll(
        prev,
        direction === Direction.HORIZONTAL ? event.deltaY : -event.deltaY,
        () =>
          setPosition((prev: number) =>
            minmax(
              prev - 1,
              0,
              direction === Direction.HORIZONTAL ? dimensions.x : dimensions.y,
            ),
          ),
        () =>
          setPosition((prev: number) =>
            minmax(
              prev + 1,
              0,
              direction === Direction.HORIZONTAL ? dimensions.x : dimensions.y,
            ),
          ),
      ),
    );
  }

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.addEventListener("wheel", adjustPositionWithScroll);
      sliderRef.current.addEventListener("mousedown", startSliderInteraction);
      sliderRef.current.addEventListener("touchstart", startSliderInteraction);
    }

    return () => {
      if (sliderRef.current) {
        sliderRef.current.removeEventListener(
          "wheel",
          adjustPositionWithScroll,
        );
        sliderRef.current.removeEventListener(
          "mousedown",
          startSliderInteraction,
        );
        sliderRef.current.removeEventListener(
          "touchstart",
          startSliderInteraction,
        );
      }
    };
  });

  return { sliderRef, isDragging };
}
