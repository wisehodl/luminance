import { useState } from "react";

import ValueEditor from "./ValueEditor";

function TestWrapper() {
  const [value, setValue] = useState(0);
  return (
    <div style={{ width: 400, height: 25 }}>
      <ValueEditor
        componentSymbol="R"
        range={{ min: 0, max: 255 }}
        value={value}
        setValue={setValue}
      />
    </div>
  );
}

describe("component editor tests", () => {
  beforeEach(() => {
    cy.clock();
    cy.mount(<TestWrapper />);
  });

  afterEach(() => {
    cy.clock().then((clock) => clock.restore());
  });

  it("works with mouse events", () => {
    // Check initial state
    cy.dataCy("R-slider-bar")
      .should("have.css", "width", "0px")
      .dataCy("R-value-input")
      .should("have.value", "0");

    // Test slider click
    cy.dataCy("R-slider")
      .click()
      .dataCy("R-slider-bar")
      .should("have.css", "width", "141px")
      .dataCy("R-value-input")
      .should("have.value", "128");

    // Test slider scroll
    cy.dataCy("R-slider")
      // scroll twice to ensure position moves enough to trigger value change.
      .trigger("wheel", { deltaY: -100, eventConstructor: "WheelEvent" })
      .trigger("wheel", { deltaY: -100, eventConstructor: "WheelEvent" })
      .dataCy("R-value-input")
      .should("have.value", "129");

    // Input focus should select text
    cy.dataCy("R-value-input")
      .focus()
      .should("have.prop", "selectionStart", 0)
      .should("have.prop", "selectionEnd")
      .should("be.gt", 0);

    // Input value should update slider
    cy.dataCy("R-value-input")
      .type("100")
      .should("have.value", "100")
      .dataCy("R-slider-bar")
      .should("have.css", "width", "111px");

    // Scrolling input should update value
    cy.dataCy("R-value-input")
      .trigger("wheel", { deltaY: -100, eventConstructor: "WheelEvent" })
      .should("have.value", "101")
      .dataCy("R-slider-bar")
      .should("have.css", "width", "112px");

    // Test increment/decrement buttons
    cy.dataCy("R-decrement-button")
      .click()
      .dataCy("R-value-input")
      .should("have.value", "100")
      .dataCy("R-increment-button")
      .click()
      .dataCy("R-value-input")
      .should("have.value", "101");

    // Test button long press repeat
    cy.dataCy("R-decrement-button")
      .trigger("mousedown")
      .then(() => {
        cy.tick(650);
        cy.tick(150 * 2);
      })
      .dataCy("R-decrement-button")
      .trigger("mouseup")
      .dataCy("R-value-input")
      .should("have.value", "98")
      .dataCy("R-increment-button")
      .trigger("mousedown")
      .then(() => {
        cy.tick(650);
        cy.tick(150 * 2);
      })
      .dataCy("R-increment-button")
      .trigger("mouseup")
      .dataCy("R-value-input")
      .should("have.value", "101");
  });

  it("works with touch events", () => {
    // Check initial state
    cy.dataCy("R-slider-bar")
      .should("have.css", "width", "0px")
      .dataCy("R-value-input")
      .should("have.value", "0");

    // Test slider click
    cy.dataCy("R-slider")
      .click()
      .dataCy("R-slider-bar")
      .should("have.css", "width", "141px")
      .dataCy("R-value-input")
      .should("have.value", "128");

    // Test button long press repeat
    cy.dataCy("R-decrement-button")
      .trigger("touchstart")
      .then(() => {
        cy.tick(650);
        cy.tick(150 * 2);
      })
      .dataCy("R-decrement-button")
      .trigger("touchend")
      .dataCy("R-value-input")
      .should("have.value", "125")
      .dataCy("R-increment-button")
      .trigger("touchstart")
      .then(() => {
        cy.tick(650);
        cy.tick(150 * 2);
      })
      .dataCy("R-increment-button")
      .trigger("touchend")
      .dataCy("R-value-input")
      .should("have.value", "128");
  });
});
