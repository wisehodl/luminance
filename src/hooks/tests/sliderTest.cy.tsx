import { useState, useRef, useEffect } from "react";
import { useSlider, Direction } from "../slider";
import type { CartesianSpace } from "../../types";

// Test Fixtures

function printMeasurements(name: string, rect: DOMRect | undefined) {
  console.log(
    `${name} Measurements: (${rect?.left}, ${rect?.top}), (${rect?.width}, ${rect?.height})`,
  );
}

function TestSlider() {
  const [origin, setOrigin] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<CartesianSpace>({ x: 0, y: 0 });
  const [position, setPosition] = useState(0);
  const { sliderRef, isDragging } = useSlider({
    direction: Direction.HORIZONTAL,
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
      setDimensions({ x: rect.width, y: rect!.height });
    }
  }, []);

  return (
    <>
      <div
        data-cy="slider-container"
        ref={sliderRef}
        style={{
          position: "relative",
          width: 375,
          height: 50,
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
            left: 25,
            right: 25,
            top: 0,
            bottom: 0,
            background: "rgb(200,200,200)",
          }}
        />
        <span
          data-cy="slider-handle"
          ref={handleRef}
          style={{
            position: "absolute",
            left: position,
            top: 0,
            width: 50,
            height: 50,
            background: "rgba(255,0,0,0.5)",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        />
      </div>
      <p>
        Position: <span data-cy="position-display">{position}</span>px
      </p>
    </>
  );
}

// Tests

describe("Slider Hook Tests", () => {
  beforeEach(() => {
    cy.mount(<TestSlider />);
  });

  const assertPosition = (expectedPosition: number) => {
    cy.dataCy("position-display").should("contain", expectedPosition);
    cy.dataCy("slider-handle").should(
      "have.css",
      "left",
      `${expectedPosition}px`,
    );
  };

  const triggerMouseEvent = (eventType: string, x: number, y: number) => {
    cy.dataCy("slider-container").trigger(eventType, {
      clientX: x,
      clientY: y,
      eventConstructor: "MouseEvent",
    });
  };

  it("moves the slider with mouse drag.", () => {
    assertPosition(0);

    triggerMouseEvent("mousedown", 86, 53);
    assertPosition(0);

    triggerMouseEvent("mousemove", 150, 150);
    assertPosition(64);

    triggerMouseEvent("mousemove", 500, 500);
    assertPosition(325);

    triggerMouseEvent("mousemove", 250, 250);
    assertPosition(164);

    triggerMouseEvent("mouseup", 250, 250);
    assertPosition(164);
  });
});
