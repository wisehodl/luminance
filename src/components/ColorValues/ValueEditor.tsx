import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent, RefObject } from "react";

import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import clsx from "clsx";
import * as colorlib from "colorlib";

import type { HexColorActions } from "@/hooks/color";
import { useScroll } from "@/hooks/scroll";
import { useSlider } from "@/hooks/slider";
import { useResize } from "@/hooks/window";
import type { CartesianSpace, Range, Setter, Timeout } from "@/types";
import { Direction } from "@/types";
import { minmax, roundTo, setMeasurements, valueToPosition } from "@/util";

import styles from "./ColorValues.module.css";

// ------------ //
// Value Editor //
// ------------ //

// Component
export function ValueEditor({
  componentSymbol,
  valueRange,
  value,
  setValue,
  scale = 1,
  onKeyDown = null,
}: {
  componentSymbol: string;
  valueRange: Range;
  value: number;
  setValue: Setter<number>;
  scale?: number;
  onKeyDown?: ((e: React.KeyboardEvent) => void) | null;
}) {
  // Set up component state
  const direction = Direction.HORIZONTAL;
  const [origin, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const newPosition = valueToPosition(value, dimensions.x, valueRange);
    setPosition(newPosition);
  }, [value, dimensions, valueRange]);

  // Handler functions
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value, 10);
    if (!isNaN(inputValue)) {
      const actualValue = Math.floor(inputValue) / scale;
      const newValue = minmax(actualValue, valueRange.min, valueRange.max);

      setValue(newValue);
    } else {
      setValue(valueRange.min);
    }
  };

  const handleValueStep = (step: number) => {
    setValue((prev) => {
      const scaledStep = step / scale;
      const newValue = minmax(
        roundTo(Math.floor(roundTo(prev * scale, 6)) / scale + scaledStep, 6),
        valueRange.min,
        valueRange.max,
      );
      return newValue;
    });
  };

  // Set up slider hook
  const { sliderRef } = useSlider({
    direction,
    origin,
    dimensions,
    valueRange,
    value,
    setValue,
  });

  // Set component dimensions for slider hook
  useEffect(() => {
    setMeasurements(sliderRef, setOrigin, setDimensions);
    return useResize(() =>
      setMeasurements(sliderRef, setOrigin, setDimensions),
    );
  }, [sliderRef, setOrigin, setDimensions]);

  return (
    <div
      className={styles.componentWrapper}
      role="group"
      aria-labelledby={`${componentSymbol}-label`}
      data-cy={`${componentSymbol}-editor`}
    >
      <Label componentSymbol={componentSymbol} />

      <Slider
        sliderRef={sliderRef}
        position={position}
        dimensions={dimensions}
        componentSymbol={componentSymbol}
        onKeyDown={onKeyDown}
      />

      <Button
        direction="decrease"
        handleValueStep={handleValueStep}
        componentSymbol={componentSymbol}
        onKeyDown={onKeyDown}
      />

      <Value
        value={value}
        onChange={handleInputChange}
        valueRange={valueRange}
        componentSymbol={componentSymbol}
        handleValueStep={handleValueStep}
        scale={scale}
        onKeyDown={onKeyDown}
      />

      <Button
        direction="increase"
        handleValueStep={handleValueStep}
        componentSymbol={componentSymbol}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

// Subcomponents
function Label({ componentSymbol }: { componentSymbol: string }) {
  return (
    <div
      id={`${componentSymbol}-label`}
      className={clsx(styles.section, styles.symbol)}
      data-cy={`${componentSymbol}-label`}
    >
      {componentSymbol}
    </div>
  );
}

function Slider({
  sliderRef,
  position,
  dimensions,
  componentSymbol,
  onKeyDown,
}: {
  sliderRef: RefObject<HTMLDivElement | null>;
  position: number;
  dimensions: CartesianSpace;
  componentSymbol: string;
  onKeyDown?: ((e: React.KeyboardEvent) => void) | null;
}) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      (e.target as HTMLElement).blur();
    } else if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className={clsx(styles.section, styles.sliderSection)}>
      <div
        className={styles.sliderWrapper}
        ref={sliderRef}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={dimensions.x}
        aria-valuenow={position}
        aria-labelledby={`${componentSymbol}-label`}
        tabIndex={0}
        data-cy={`${componentSymbol}-slider`}
        onKeyDown={handleKeyDown}
      >
        <div
          className={styles.sliderBar}
          style={{ width: position }}
          data-cy={`${componentSymbol}-slider-bar`}
        ></div>
      </div>
    </div>
  );
}

function Button({
  direction,
  componentSymbol,
  handleValueStep,
  onKeyDown,
}: {
  direction: "increase" | "decrease";
  componentSymbol: string;
  handleValueStep: (step: number) => void;
  onKeyDown?: ((e: React.KeyboardEvent) => void) | null;
}) {
  const isIncrease = direction === "increase";
  const label = isIncrease ? "Increase" : "Decrease";
  const icon = isIncrease ? faChevronRight : faChevronLeft;
  const dataCy = `${componentSymbol}-${isIncrease ? "increment" : "decrement"}-button`;

  const step = isIncrease ? 1 : -1;
  const onClick = () => handleValueStep(step);
  const longPressProps = useLongPressRepeat(onClick);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      (e.target as HTMLElement).blur();
    } else if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className={clsx(styles.section, styles.buttonWrapper)}>
      <button
        className={styles.button}
        onClick={onClick}
        {...longPressProps}
        aria-label={`${label} ${componentSymbol}`}
        data-cy={dataCy}
        onKeyDown={handleKeyDown}
      >
        <FontAwesomeIcon icon={icon} transform="shrink-2 down-1" />
      </button>
    </div>
  );
}

function Value({
  value,
  onChange,
  valueRange,
  componentSymbol,
  handleValueStep,
  scale,
  onKeyDown,
}: {
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  valueRange: { min: number; max: number };
  componentSymbol: string;
  handleValueStep: (step: number) => void;
  scale: number;
  onKeyDown?: ((e: React.KeyboardEvent) => void) | null;
}) {
  const valueRef = useRef(null);
  const valueScroller = useScroll({
    targetRef: valueRef,
    onScrollUp: () => handleValueStep(1),
    onScrollDown: () => handleValueStep(-1),
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      (e.target as HTMLElement).blur();
    } else if (onKeyDown) {
      onKeyDown(e);
    }
  };

  useEffect(() => {
    if (valueRef.current) {
      valueScroller.addScrollListener();
    }

    return () => {
      valueScroller.removeScrollListener();
    };
  }, [valueScroller]);

  return (
    <div className={clsx(styles.section, styles.valueWrapper)}>
      <input
        type="text"
        ref={valueRef}
        value={Math.floor(value * scale)}
        onChange={onChange}
        className={styles.value}
        onFocus={(e) => e.target.select()}
        aria-label={`${componentSymbol} value input`}
        aria-valuemin={valueRange.min}
        aria-valuemax={valueRange.max}
        aria-valuenow={value}
        data-cy={`${componentSymbol}-value-input`}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

// Hooks
function useLongPressRepeat(
  callback: () => void,
  startDelay = 650,
  repeatInterval = 150,
) {
  const timeoutRef = useRef<Timeout>(null);
  const intervalRef = useRef<Timeout>(null);

  const cleanup = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  // Intentional 'any' to avoid overly complex typing
  const start = () => {
    cleanup();

    timeoutRef.current = setTimeout(() => {
      callback();
      intervalRef.current = setInterval(callback, repeatInterval);
    }, startDelay);
  };

  const stop = cleanup;

  useEffect(() => cleanup, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
    // Intentional 'any' to avoid overly complex typing
    onContextMenu: (e: Event | any) => e.preventDefault(),
  };
}

// ---------- //
// Hex Editor //
// ---------- //

const extractHexValue = (value: string): string | null => {
  const match = value.match(/^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/);
  return match ? match[1] : null;
};

const formatHexString = (
  color: colorlib.Hex,
  preserveShortFormat: boolean = false,
): string => {
  const hexValue = color.to_code();

  if (preserveShortFormat) {
    if (
      hexValue[0] === hexValue[1] &&
      hexValue[2] === hexValue[3] &&
      hexValue[4] === hexValue[5]
    ) {
      return `#${hexValue[0]}${hexValue[2]}${hexValue[4]}`;
    }
  }

  return `#${color.to_code()}`;
};

export function HexEditor({
  color,
  actions,
  onKeyDown,
}: {
  color: colorlib.Hex;
  actions: HexColorActions;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const [inputValue, setInputValue] = useState(formatHexString(color));
  const [isShortHex, setIsShortHex] = useState(false);

  useEffect(() => {
    setInputValue(formatHexString(color, isShortHex));
  }, [color]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const hex = extractHexValue(value);
    if (hex) {
      setIsShortHex(hex.length === 3);
      const newColor = colorlib.Hex.from_code(hex);
      actions.setHex(newColor);
    }
  };

  const onBlur = () => {
    setInputValue(formatHexString(color));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      (e.target as HTMLElement).blur();
    } else if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div data-cy="hex-editor" className={styles.hexEditor}>
      <div className={clsx(styles.section, styles.hexLabel)}>HEX</div>
      <div className={clsx(styles.section, styles.hexValueWrapper)}>
        <input
          type="text"
          data-cy="hex-value-input"
          value={inputValue}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={(e) => e.target.select()}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
