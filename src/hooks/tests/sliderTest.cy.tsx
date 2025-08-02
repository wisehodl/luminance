import { useEffect, useRef, useState } from "react";

import type { CartesianSpace } from "../../types";
import { Direction, useSlider } from "../slider";

// Test Fixtures

function TestSlider({
  direction = Direction.HORIZONTAL,
}: {
  direction?: Direction;
}) {
  const [origin, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [position, setPosition] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const { sliderRef, isDragging } = useSlider({
    direction,
    origin,
    dimensions,
    setPosition,
  });

  const railRef = useRef<HTMLSpanElement>(null);
  const handleRef = useRef<HTMLSpanElement | null>(null);

  // Set slider dimensions post render
  useEffect(() => {
    const element = railRef.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setOrigin({ x: rect.left, y: rect.top });
      setDimensions({ x: rect.width, y: rect.height });
    }
  }, []);

  useEffect(() => {
    const maxValue =
      direction == Direction.HORIZONTAL ? dimensions.x : dimensions.y;
    if (maxValue > 0) {
      const percentage = parseFloat(((position / maxValue) * 100).toFixed(3));
      setSliderValue(percentage);
    } else {
      setSliderValue(0);
    }
  }, [dimensions, direction, position]);

  const isHorizontal = direction === Direction.HORIZONTAL;

  return (
    <>
      <div
        data-cy="slider-container"
        ref={sliderRef}
        style={{
          position: "relative",
          width: isHorizontal ? 300 : 50,
          height: isHorizontal ? 50 : 300,
          border: "3px solid black",
          margin: 50,
          cursor: "pointer",
        }}
      >
        <span
          data-cy="slider-rail"
          ref={railRef}
          style={{
            position: "absolute",
            left: isHorizontal ? 25 : 0,
            right: isHorizontal ? 25 : 0,
            top: isHorizontal ? 0 : 25,
            bottom: isHorizontal ? 0 : 25,
            background: "rgb(200,200,200)",
          }}
        />
        <span
          data-cy="slider-handle"
          ref={handleRef}
          style={{
            position: "absolute",
            ...(isHorizontal
              ? { left: position, top: 0 }
              : { left: 0, top: position }),
            width: 50,
            height: 50,
            background: "rgba(255,0,0,0.5)",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        />
      </div>
      <p>
        Position: <span data-cy="position-display">{position}</span>px
        <br /> Value: <span data-cy="value-display">{sliderValue}</span>
      </p>
    </>
  );
}

function createTestUtils(isHorizontal = true) {
  const assertPosition = (expectedPosition: number) => {
    cy.dataCy("position-display").should("contain", expectedPosition);
    cy.dataCy("slider-handle").should(
      "have.css",
      isHorizontal ? "left" : "top",
      `${expectedPosition}px`,
    );
  };

  const triggerMouseEvent = (eventType: string, x: number, y: number) => {
    cy.dataCy("slider-container").trigger(eventType, {
      clientX: x,
      clientY: y,
      buttons: 1,
      eventConstructor: "MouseEvent",
    });
  };

  const triggerTouchEvent = (eventType: string, x: number, y: number) => {
    cy.dataCy("slider-container").trigger(eventType, {
      clientX: x,
      clientY: y,
      touches: [{ clientX: x, clientY: y }],
      eventConstructor: "TouchEvent",
    });
  };

  const triggerWheelEvent = (deltaY: number) => {
    cy.dataCy("slider-container").trigger("wheel", {
      deltaY,
      eventConstructor: "WheelEvent",
    });
  };

  return {
    assertPosition,
    triggerMouseEvent,
    triggerTouchEvent,
    triggerWheelEvent,
  };
}

const isTouchSupported = () => {
  return typeof TouchEvent !== "undefined";
};

// Tests

describe("horizontal slider hook tests", () => {
  beforeEach(() => {
    cy.mount(<TestSlider direction={Direction.HORIZONTAL} />);
  });

  const {
    assertPosition,
    triggerMouseEvent,
    triggerTouchEvent,
    triggerWheelEvent,
  } = createTestUtils(true);

  it("moves the slider with mouse events.", () => {
    assertPosition(0);

    triggerMouseEvent("mousedown", 86, 53);
    assertPosition(0);

    triggerMouseEvent("mousemove", 150, 150);
    assertPosition(64);

    triggerMouseEvent("mousemove", 500, 500);
    assertPosition(250);

    triggerMouseEvent("mousemove", 250, 250);
    assertPosition(164);

    triggerMouseEvent("mouseup", 250, 250);
    assertPosition(164);
  });

  it("moves the slider with touch events.", () => {
    assertPosition(0);

    triggerTouchEvent("touchstart", 86, 53);
    assertPosition(0);

    triggerTouchEvent("touchmove", 150, 150);
    assertPosition(64);

    triggerTouchEvent("touchmove", 500, 500);
    assertPosition(250);

    triggerTouchEvent("touchmove", 250, 250);
    assertPosition(164);

    triggerTouchEvent("touchend", 250, 250);
    assertPosition(164);
  });

  it("moves the slider with mouse wheel scrolling", () => {
    assertPosition(0);

    triggerWheelEvent(100);
    assertPosition(1);

    triggerWheelEvent(100);
    assertPosition(2);

    triggerWheelEvent(-100);
    assertPosition(1);

    // Many smaller scrolls, to simulate touchpads
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    assertPosition(4);
  });
});

describe("vertical slider hook tests", () => {
  beforeEach(() => {
    cy.mount(<TestSlider direction={Direction.VERTICAL} />);
  });

  const {
    assertPosition,
    triggerMouseEvent,
    triggerTouchEvent,
    triggerWheelEvent,
  } = createTestUtils(false);

  it("moves the slider with mouse drag.", () => {
    assertPosition(0);

    triggerMouseEvent("mousedown", 86, 53);
    assertPosition(0);

    triggerMouseEvent("mousemove", 150, 150);
    assertPosition(72);

    triggerMouseEvent("mousemove", 500, 500);
    assertPosition(250);

    triggerMouseEvent("mousemove", 250, 250);
    assertPosition(172);

    triggerMouseEvent("mouseup", 250, 250);
    assertPosition(172);
  });

  it("moves the slider with touch events.", () => {
    assertPosition(0);

    triggerTouchEvent("touchstart", 86, 53);
    assertPosition(0);

    triggerTouchEvent("touchmove", 150, 150);
    assertPosition(72);

    triggerTouchEvent("touchmove", 500, 500);
    assertPosition(250);

    triggerTouchEvent("touchmove", 250, 250);
    assertPosition(172);

    triggerTouchEvent("touchend", 250, 250);
    assertPosition(172);
  });

  it("moves the slider with mouse wheel scrolling", () => {
    assertPosition(0);

    triggerWheelEvent(100);
    assertPosition(1);

    triggerWheelEvent(100);
    assertPosition(2);

    triggerWheelEvent(-100);
    assertPosition(1);

    // Many smaller scrolls, to simulate touchpads
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    triggerWheelEvent(20);
    assertPosition(4);
  });
});
