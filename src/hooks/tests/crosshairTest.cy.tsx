import { useEffect, useRef, useState } from "react";

import type { CartesianSpace } from "@/types";

import { useCrosshair } from "../crosshair";

// Test Fixtures

function TestSquare() {
  const [origin, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [xPosition, setXPosition] = useState(0);
  const [yPosition, setYPosition] = useState(0);
  const [xValue, setXValue] = useState(0);
  const [yValue, setYValue] = useState(0);
  const xValueRange = { min: 0, max: 100 };
  const yValueRange = { min: 0, max: 100 };

  const { crosshairRef, isDragging } = useCrosshair({
    origin,
    dimensions,
    setXPosition,
    setYPosition,
    xValue,
    yValue,
    setXValue,
    setYValue,
    xValueRange,
    yValueRange,
  });

  const boundaryRef = useRef<HTMLDivElement>(null);
  const xCrosshairRef = useRef<HTMLSpanElement>(null);
  const yCrosshairRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = boundaryRef.current;

    if (element) {
      const rect = element.getBoundingClientRect();

      setOrigin({ x: rect.left, y: rect.top });
      setDimensions({ x: rect.width, y: rect.height });
    }
  }, []);

  return (
    <>
      <div
        ref={crosshairRef}
        data-cy="crosshair-container"
        style={{
          position: "relative",
          width: 250,
          height: 250,
          margin: 50,
          border: "3px solid black",
          cursor: "crosshair",
        }}
      >
        <div
          ref={boundaryRef}
          data-cy="boundary"
          style={{
            position: "absolute",
            top: 12,
            bottom: 12,
            right: 12,
            left: 12,
            background: "rgb(200, 200, 200)",
          }}
        ></div>
        <span
          ref={yCrosshairRef}
          data-cy="y-crosshair"
          style={{
            position: "absolute",
            width: 250,
            height: 25,
            top: yPosition,
            left: 0,
            background: "rgba(255, 0, 0, 0.5)",
            pointerEvents: "none",
          }}
        />
        <span
          ref={xCrosshairRef}
          data-cy="x-crosshair"
          style={{
            position: "absolute",
            width: 25,
            height: 250,
            top: 0,
            left: xPosition,
            background: "rgba(0, 255, 0, 0.5)",
            pointerEvents: "none",
          }}
        />
      </div>
      <p>
        X Position: <span data-cy="x-position-display">{xPosition}</span>px
        <br />Y Position: <span data-cy="y-position-display">{yPosition}</span>
        px
      </p>
      <p>
        Is Dragging:{" "}
        <span data-cy="is-dragging-display">
          {isDragging ? "True" : "False"}
        </span>
      </p>
      <p>
        X Value: <span data-cy="x-value-display">{xValue}</span>
        <br />Y Value: <span data-cy="y-value-display">{yValue}</span>
      </p>
    </>
  );
}

// Tests

const assertPosition = (
  expectedXPosition: number,
  expectedYPosition: number,
) => {
  cy.dataCy("x-position-display").should("contain", expectedXPosition);
  cy.dataCy("y-position-display").should("contain", expectedYPosition);

  cy.dataCy("x-crosshair").should("have.css", "left", `${expectedXPosition}px`);
  cy.dataCy("y-crosshair").should("have.css", "top", `${expectedYPosition}px`);
};

const triggerMouseEvent = (eventType: string, x: number, y: number) => {
  cy.dataCy("crosshair-container").trigger(eventType, {
    clientX: x,
    clientY: y,
    buttons: 1,
    eventConstructor: "MouseEvent",
  });
};

const triggerTouchEvent = (eventType: string, x: number, y: number) => {
  cy.dataCy("crosshair-container").trigger(eventType, {
    clientX: x,
    clientY: y,
    touches: [{ clientX: x, clientY: y }],
    eventConstructor: "TouchEvent",
  });
};

describe("crosshair tests", () => {
  beforeEach(() => {
    cy.mount(<TestSquare />);
  });

  it("moves the crosshairs with mouse events", () => {
    assertPosition(0, 0);

    triggerMouseEvent("mousedown", 70, 60);
    assertPosition(0, 0);

    triggerMouseEvent("mousemove", 180, 180);
    assertPosition(107, 115);

    triggerMouseEvent("mousemove", 500, 500);
    assertPosition(225, 225);

    triggerMouseEvent("mousemove", 0, 250);
    assertPosition(0, 185);

    triggerMouseEvent("mouseup", 0, 250);
    assertPosition(0, 185);
  });

  it("moves the crosshairs with touch events", () => {
    assertPosition(0, 0);

    triggerTouchEvent("touchstart", 70, 60);
    assertPosition(0, 0);

    triggerTouchEvent("touchmove", 180, 180);
    assertPosition(107, 115);

    triggerTouchEvent("touchmove", 500, 500);
    assertPosition(225, 225);

    triggerTouchEvent("touchmove", 0, 250);
    assertPosition(0, 185);

    triggerTouchEvent("touchend", 0, 250);
    assertPosition(0, 185);
  });
});
