import { useState, useRef, useEffect, useCallback } from "react";
import type { RefObject } from "react";

export function handleScroll(
  prevLength: number,
  scrollDelta: number,
  handleIncrement: () => void,
  handleDecrement: () => void,
): number {
  const newLength = prevLength + scrollDelta;

  if (Math.abs(newLength) > 50) {
    if (newLength > 0) {
      handleIncrement();
    } else if (newLength < 0) {
      handleDecrement();
    }

    return 0;
  }

  return newLength;
}

type ScrollHandler = () => void;

export function useScroll<T extends HTMLElement>({
  targetRef,
  onScrollUp,
  onScrollDown,
  deltaYMultiplier: deltaYMultiplier = 1,
}: {
  targetRef: RefObject<T | null>;
  onScrollUp: ScrollHandler;
  onScrollDown: ScrollHandler;
  deltaYMultiplier?: number;
}) {
  const [_, setScrollLength] = useState(0);

  const onScrollUpRef = useRef(onScrollUp);
  const onScrollDownRef = useRef(onScrollDown);
  const deltaYMultiplierRef = useRef(deltaYMultiplier);

  useEffect(() => {
    onScrollUpRef.current = onScrollUp;
    onScrollDownRef.current = onScrollDown;
    deltaYMultiplierRef.current = deltaYMultiplier;
  }, [onScrollUp, onScrollDown, deltaYMultiplier]);

  const handleWheelEvent = useCallback((event: WheelEvent) => {
    event.preventDefault();

    setScrollLength((prev) =>
      handleScroll(
        prev,
        event.deltaY * deltaYMultiplierRef.current,
        onScrollDownRef.current,
        onScrollUpRef.current,
      ),
    );
  }, []);

  const addScrollListener = useCallback(() => {
    const currentRef = targetRef.current;
    if (currentRef) {
      currentRef.addEventListener("wheel", handleWheelEvent);
    }
  }, [handleWheelEvent, targetRef]);

  const removeScrollListener = useCallback(() => {
    const currentRef = targetRef.current;
    if (currentRef) {
      currentRef.removeEventListener("wheel", handleWheelEvent);
    }
  }, [handleWheelEvent, targetRef]);

  useEffect(() => {
    return () => {
      removeScrollListener();
    };
  }, [removeScrollListener]);

  return {
    addScrollListener,
    removeScrollListener,
  };
}
