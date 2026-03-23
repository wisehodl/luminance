import { useReducer } from "react";

import { Color } from "colorlib";

import { colorReducer, createColorActions } from "@/hooks/color";

import { ValueEditor } from "./ValueEditor";

const initialState = {
  color: Color.from_hex("000"),
};

function TestWrapper() {
  const [state, dispatch] = useReducer(colorReducer, initialState);
  const actions = createColorActions(dispatch);

  return (
    <div
      style={{
        width: 400,
        height: 25,
        display: "flex",
        flexDirection: "column",
        border: "2px solid #7a7a7a",
      }}
    >
      <ValueEditor
        componentSymbol="R"
        valueRange={{ min: 0, max: 255 }}
        value={state.color.rgb.r}
        setValue={actions.rgb.setR}
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
      .should("have.css", "width", "140px")
      .dataCy("R-value-input")
      .should("have.value", "127");

    // Test slider scroll
    cy.dataCy("R-slider")
      // scroll twice to ensure position moves enough to trigger value change.
      .trigger("wheel", { deltaY: -100, eventConstructor: "WheelEvent" })
      .trigger("wheel", { deltaY: -100, eventConstructor: "WheelEvent" })
      .dataCy("R-value-input")
      .should("have.value", "128")
      .wait(50);

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
      .should("have.css", "width", "110px");

    // Scrolling input should update value
    cy.dataCy("R-value-input")
      .trigger("wheel", { deltaY: -100, eventConstructor: "WheelEvent" })
      .should("have.value", "100")
      .dataCy("R-slider-bar")
      .should("have.css", "width", "110px")
      .wait(50);

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
      .should("have.css", "width", "140px")
      .dataCy("R-value-input")
      .should("have.value", "127");

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
      .should("have.value", "124")
      .dataCy("R-increment-button")
      .trigger("touchstart")
      .then(() => {
        cy.tick(650);
        cy.tick(150 * 2);
      })
      .dataCy("R-increment-button")
      .trigger("touchend")
      .dataCy("R-value-input")
      .should("have.value", "127");
  });

  it("works with keyboard events", () => {
    // Tab through components
    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.dataCy("R-slider").should("have.focus");

    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.dataCy("R-decrement-button").should("have.focus");

    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.dataCy("R-value-input").should("have.focus");

    cy.press(Cypress.Keyboard.Keys.TAB);
    cy.dataCy("R-increment-button").should("have.focus");

    // Pressing Escape should blur focused element
    cy.dataCy("R-increment-button").type("{esc}");
    cy.dataCy("R-increment-button").should("not.have.focus");

    cy.dataCy("R-slider").focus();
    cy.dataCy("R-slider").type("{esc}");
    cy.dataCy("R-slider").should("not.have.focus");

    cy.dataCy("R-decrement-button").focus();
    cy.dataCy("R-decrement-button").type("{esc}");
    cy.dataCy("R-decrement-button").should("not.have.focus");

    cy.dataCy("R-value-input").focus();
    cy.dataCy("R-value-input").type("{esc}");
    cy.dataCy("R-value-input").should("not.have.focus");
  });
});
