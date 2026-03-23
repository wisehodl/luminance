import type { RefObject } from "react";

import { Hex } from "colorlib";

import type { CartesianSpace, Range } from "./types";
import { Direction } from "./types";

export function minmax(number: number, min: number, max: number) {
  return Math.min(max, Math.max(min, number));
}

export function isTouchEvent(event: Event): event is TouchEvent {
  return "touches" in event;
}

export function isLeftMouseButton(buttonsValue: number) {
  return buttonsValue === 1;
}

export function extractEventCoordinates(event: MouseEvent | TouchEvent): {
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

export function setMeasurements(
  ref: RefObject<HTMLElement | null>,
  setOrigin: (newOrigin: CartesianSpace) => void,
  setDimensions: (newDimensions: CartesianSpace) => void,
) {
  const el = ref.current;

  if (el) {
    const rect = el.getBoundingClientRect();

    setOrigin({ x: rect.left, y: rect.top });
    setDimensions({ x: rect.width, y: rect.height });
  }
}

export function valueToPosition(
  value: number,
  maxPosition: number,
  valueRange: Range,
) {
  if (maxPosition <= 0 || !isFinite(value)) return 0;

  const rangeSpan = Math.abs(valueRange.min) + Math.abs(valueRange.max);
  if (rangeSpan === 0) return 0;

  const position = Math.round(
    maxPosition *
      ((value + Math.abs(valueRange.min)) /
        (Math.abs(valueRange.min) + Math.abs(valueRange.max))),
  );
  return position;
}

export function positionToValue(
  position: number,
  maxPosition: number,
  valueRange: Range,
) {
  if (maxPosition <= 0 || !isFinite(position)) return valueRange.min;

  const rangeSpan = Math.abs(valueRange.min) + Math.abs(valueRange.max);
  if (rangeSpan === 0) return valueRange.min;

  const value =
    (position / maxPosition) *
      (Math.abs(valueRange.min) + Math.abs(valueRange.max)) -
    Math.abs(valueRange.min);

  return value;
}

export function chooseValueByDirection(
  direction: Direction,
  xValue: number,
  yValue: number,
) {
  return direction === Direction.HORIZONTAL ? xValue : yValue;
}

export function roundTo(
  value: number,
  decimals: number = 0,
  direction: "up" | "down" | null = null,
) {
  const factor = Math.pow(10, decimals);
  switch (direction) {
    case "up":
      return Math.ceil(value * factor) / factor;
    case "down":
      return Math.floor(value * factor) / factor;
    default:
      return Math.round(value * factor) / factor;
  }
}

export function formatCssRgb(hex: Hex) {
  return `rgb(${hex.r},${hex.g},${hex.b})`;
}

export function formatCssRgbs(hex: Hex, alpha: number) {
  return `rgb(${hex.r},${hex.g},${hex.b},${roundTo(alpha, 2)})`;
}

export function randomId(): string {
  return Math.random().toString(36).slice(2, 8);
}
