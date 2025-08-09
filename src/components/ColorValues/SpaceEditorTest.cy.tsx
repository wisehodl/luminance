import { useReducer } from "react";

import { Color } from "colorlib";

import { roundTo } from "@/util";
import { colorReducer, createColorActions } from "@hooks/color";

import SpaceEditor from "./SpaceEditor";

const initialState = {
  color: Color.from_hex("2edd9d"),
};

function TestWrapper() {
  const [state, dispatch] = useReducer(colorReducer, initialState);
  const actions = createColorActions(dispatch);

  return (
    <>
      <div
        style={{
          width: "100%",
          height: 300,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SpaceEditor
          space="HCL"
          color={state.color.hcl}
          actions={actions.hcl}
        />
        <SpaceEditor
          space="HSV"
          color={state.color.hsv}
          actions={actions.hsv}
        />
        <SpaceEditor
          space="RGB"
          color={state.color.rgb}
          actions={actions.rgb}
        />
      </div>

      <div style={{ fontFamily: "monospace" }}>
        <p data-cy="hcl-value">
          HCL ({roundTo(state.color.hcl.h, 0)}, {roundTo(state.color.hcl.c, 2)},{" "}
          {roundTo(state.color.hcl.l, 2)})
        </p>
        <p data-cy="hsv-value">
          HSV ({roundTo(state.color.hsv.h, 0)}, {roundTo(state.color.hsv.s, 2)},{" "}
          {roundTo(state.color.hsv.v, 2)})
        </p>
        <p data-cy="rgb-value">
          RGB ({roundTo(state.color.rgb.r, 0)}, {roundTo(state.color.rgb.g, 0)},{" "}
          {roundTo(state.color.rgb.b, 0)})
        </p>
        <p data-cy="hex-value">HEX: #{state.color.hex.to_code()}</p>
      </div>
    </>
  );
}

describe("space editor tests", () => {
  it("can edit color values", () => {
    cy.mount(<TestWrapper />);

    // Confirm initial values
    cy.dataCy("RGB-editor").within(() => {
      cy.dataCy("R-value-input").should("have.value", 46);
      cy.dataCy("G-value-input").should("have.value", 221);
      cy.dataCy("B-value-input").should("have.value", 157);
    });

    cy.dataCy("HSV-editor").within(() => {
      cy.dataCy("H-value-input").should("have.value", 158);
      cy.dataCy("S-value-input").should("have.value", 79);
      cy.dataCy("V-value-input").should("have.value", 87);
    });

    cy.dataCy("HCL-editor").within(() => {
      cy.dataCy("H-value-input").should("have.value", 158);
      cy.dataCy("C-value-input").should("have.value", 79);
      cy.dataCy("L-value-input").should("have.value", 70);
    });

    cy.dataCy("rgb-value").should("have.text", "RGB (46, 221, 157)");
    cy.dataCy("hsv-value").should("have.text", "HSV (158, 0.79, 0.87)");
    cy.dataCy("hcl-value").should("have.text", "HCL (158, 0.79, 0.7)");
    cy.dataCy("hex-value").should("have.text", "HEX: #2EDD9D");

    // Update the color values
    cy.wait(50); // ensure render
    cy.dataCy("HCL-editor").within(() => {
      cy.dataCy("H-slider").click();
      cy.dataCy("C-decrement-button").click();
      cy.dataCy("L-value-input").type("25");
    });

    cy.dataCy("rgb-value").should("have.text", "RGB (17, 76, 75)");
    cy.dataCy("hsv-value").should("have.text", "HSV (179, 0.78, 0.3)");
    cy.dataCy("hcl-value").should("have.text", "HCL (179, 0.78, 0.25)");
    cy.dataCy("hex-value").should("have.text", "HEX: #104B4A");
  });
});
