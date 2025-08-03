import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";

import clsx from "clsx";

import type { CartesianSpace } from "@/types";
import { minmax, setMeasurements } from "@/util";
import { useScroll } from "@hooks/scroll";
import { Direction, useSlider } from "@hooks/slider";
import { useResize } from "@hooks/window";

import styles from "./ValueEditor.module.css";

// Types
type Timeout = ReturnType<typeof setTimeout>;
interface Range {
  min: number;
  max: number;
}

// Calculation functions
const getPositionFromValue = (
  newValue: number,
  maxValue: number,
  range: Range,
) => {
  const newPosition = parseFloat(
    (
      ((newValue + Math.abs(range.min)) /
        (Math.abs(range.min) + Math.abs(range.max))) *
      maxValue
    ).toFixed(0),
  );
  return newPosition;
};

const getValueFromPosition = (
  newPosition: number,
  maxValue: number,
  range: Range,
) => {
  const newValue = parseFloat(
    (
      (newPosition / maxValue) * (Math.abs(range.min) + Math.abs(range.max)) -
      Math.abs(range.min)
    ).toFixed(0),
  );
  return newValue;
};

// Component
function ValueEditor({
  componentSymbol,
  range,
  value,
  setValue,
}: {
  componentSymbol: string;
  range: Range;
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
}) {
  // Set up component state
  const direction = Direction.HORIZONTAL;
  const [origin, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [position, setPosition] = useState(0);

  // Handler functions
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value, 10);
    if (!isNaN(inputValue)) {
      const newValue = minmax(inputValue, range.min, range.max);
      const newPosition = getPositionFromValue(newValue, dimensions.x, range);

      setValue(newValue);
      setPosition(newPosition);
    } else {
      setValue(range.min);
      setPosition(0);
    }
  };

  const handleValueStep = (step: number) => {
    setValue((prev) => {
      const newValue = minmax(prev + step, range.min, range.max);
      const newPosition = getPositionFromValue(newValue, dimensions.x, range);
      setPosition(newPosition);
      return newValue;
    });
  };

  // Set up slider hook
  const { sliderRef } = useSlider({
    direction,
    origin,
    dimensions,
    setPosition,
  });

  // Set component dimensions for slider hook
  useEffect(() => {
    setMeasurements(sliderRef, setOrigin, setDimensions);
    return useResize(() =>
      setMeasurements(sliderRef, setOrigin, setDimensions),
    );
  }, [sliderRef, setOrigin, setDimensions]);

  // Update value when position, etc. changes
  useEffect(() => {
    const maxValue = dimensions.x;
    if (maxValue > 0) {
      const newValue = getValueFromPosition(position, maxValue, range);
      setValue(newValue);
    } else {
      setValue(range.min);
    }
  }, [dimensions, position, range, setValue]);

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
        value={value}
        range={range}
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
        range={range}
        componentSymbol={componentSymbol}
        handleValueStep={handleValueStep}
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
  value,
  range,
  componentSymbol,
}: {
  sliderRef: RefObject<HTMLDivElement | null>;
  position: number;
  value: number;
  range: { min: number; max: number };
  componentSymbol: string;
}) {
  return (
    <div
      className={clsx(styles.section, styles.sliderWrapper)}
      ref={sliderRef}
      role="slider"
      aria-valuemin={range.min}
      aria-valuemax={range.max}
      aria-valuenow={value}
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
  const symbol = isIncrease ? ">" : "<";
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
        {symbol}
      </button>
    </div>
  );
}

function Value({
  value,
  onChange,
  range,
  componentSymbol,
  handleValueStep,
}: {
  value: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  range: { min: number; max: number };
  componentSymbol: string;
  handleValueStep: (step: number) => void;
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
      if (valueRef.current) {
        valueScroller.removeScrollListener();
      }
    };
  }, [valueScroller]);

  return (
    <div className={clsx(styles.section, styles.valueWrapper)}>
      <input
        type="text"
        ref={valueRef}
        value={value}
        onChange={onChange}
        className={styles.value}
        onFocus={(e) => e.target.select()}
        aria-label={`${componentSymbol} value input`}
        aria-valuemin={range.min}
        aria-valuemax={range.max}
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
  const [pressing, setPressing] = useState(false);
  const timerRef = useRef<Timeout>(null);
  const intervalRef = useRef<Timeout>(null);

  const start = useCallback(
    (e: Event | any) => {
      e.preventDefault();
      setPressing(true);
      timerRef.current = setTimeout(() => {
        callback();
        intervalRef.current = setInterval(callback, repeatInterval);
      }, startDelay);
    },
    [callback, startDelay, repeatInterval],
  );

  const stop = useCallback(() => {
    setPressing(false);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
    onContextMenu: (e: Event | any) => e.preventDefault(),
    pressing: pressing.toString(),
  };
}

export default ValueEditor;
