import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, RefObject } from "react";

import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import clsx from "clsx";

import type { CartesianSpace, Range, Setter, Timeout } from "@/types";
import { Direction } from "@/types";
import { minmax, setMeasurements, valueToPosition } from "@/util";
import { useScroll } from "@hooks/scroll";
import { useSlider } from "@hooks/slider";
import { useResize } from "@hooks/window";

import styles from "./ValueEditor.module.css";

// Component
function ValueEditor({
  componentSymbol,
  valueRange,
  value,
  setValue,
  scale = 1,
}: {
  componentSymbol: string;
  valueRange: Range;
  value: number;
  setValue: Setter<number>;
  scale?: number;
}) {
  // Set up component state
  const direction = Direction.HORIZONTAL;
  const [origin, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });
  const position = useRef(0);

  useEffect(() => {
    position.current = valueToPosition(value, dimensions.x, valueRange);
  }, [value, dimensions, valueRange]);

  // Handler functions
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value, 10);
    if (!isNaN(inputValue)) {
      const actualValue = inputValue / scale;
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
        prev + scaledStep,
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
        position={position.current}
        dimensions={dimensions}
        componentSymbol={componentSymbol}
      />

      <Button
        direction="decrease"
        handleValueStep={handleValueStep}
        componentSymbol={componentSymbol}
      />

      <Value
        value={value}
        onChange={handleInputChange}
        valueRange={valueRange}
        componentSymbol={componentSymbol}
        handleValueStep={handleValueStep}
        scale={scale}
      />

      <Button
        direction="increase"
        handleValueStep={handleValueStep}
        componentSymbol={componentSymbol}
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
}: {
  sliderRef: RefObject<HTMLDivElement | null>;
  position: number;
  dimensions: CartesianSpace;
  componentSymbol: string;
}) {
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
}: {
  direction: "increase" | "decrease";
  componentSymbol: string;
  handleValueStep: (step: number) => void;
}) {
  const isIncrease = direction === "increase";
  const label = isIncrease ? "Increase" : "Decrease";
  const icon = isIncrease ? faChevronRight : faChevronLeft;
  const dataCy = `${componentSymbol}-${isIncrease ? "increment" : "decrement"}-button`;

  const step = isIncrease ? 1 : -1;
  const onClick = () => handleValueStep(step);
  const longPressProps = useLongPressRepeat(onClick);

  return (
    <div className={clsx(styles.section, styles.buttonWrapper)}>
      <button
        className={styles.button}
        onClick={onClick}
        {...longPressProps}
        aria-label={`${label} ${componentSymbol}`}
        data-cy={dataCy}
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
}: {
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  valueRange: { min: number; max: number };
  componentSymbol: string;
  handleValueStep: (step: number) => void;
  scale: number;
}) {
  const valueRef = useRef(null);
  const valueScroller = useScroll({
    targetRef: valueRef,
    onScrollUp: () => handleValueStep(1),
    onScrollDown: () => handleValueStep(-1),
  });

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
        value={Math.round(value * scale)}
        onChange={onChange}
        className={styles.value}
        onFocus={(e) => e.target.select()}
        aria-label={`${componentSymbol} value input`}
        aria-valuemin={valueRange.min}
        aria-valuemax={valueRange.max}
        aria-valuenow={value}
        data-cy={`${componentSymbol}-value-input`}
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

export default ValueEditor;
