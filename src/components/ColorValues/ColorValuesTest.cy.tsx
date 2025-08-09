import { useReducer } from "react";

import { Color } from "colorlib";

import { colorReducer, createColorActions } from "@hooks/color";

import ColorValues from "./ColorValues";

const initialState = {
  color: Color.from_hex("2edd9d"),
};

function TestWrapper() {
  const [state, dispatch] = useReducer(colorReducer, initialState);
  const actions = createColorActions(dispatch);

  return (
    <div>
      <div
        style={{
          height: "75vh",
          width: "100%",
          marginBottom: 35,
        }}
      >
        <ColorValues color={state.color} actions={actions} />
      </div>
      <div
        style={{
          width: "100%",
          height: 40,
          backgroundColor: `rgb(${Math.round(state.color.rgb.r)},${Math.round(state.color.rgb.g)},${Math.round(state.color.rgb.b)})`,
        }}
      ></div>
    </div>
  );
}

describe("color values component tests", () => {
  beforeEach(() => {
    cy.mount(<TestWrapper />);
  });

  it("can cycle through inputs with Enter", () => {
    cy.dataCy("HSV-editor").within(() => {
      cy.dataCy("S-value-input").focus();
      cy.dataCy("S-value-input").type("{enter}");
      cy.dataCy("V-value-input").should("have.focus");
      cy.dataCy("V-value-input").type("{enter}");
    });

    cy.dataCy("RGB-editor").within(() => {
      cy.dataCy("R-value-input").should("have.focus");

      cy.dataCy("B-value-input").focus();
      cy.dataCy("B-value-input").type("{enter}");
    });

    cy.dataCy("hex-value-input").should("have.focus");
    cy.dataCy("hex-value-input").type("{enter}");

    cy.dataCy("HCL-editor").within(() => {
      cy.dataCy("H-value-input").should("have.focus");
      cy.dataCy("H-value-input").type("{shift}{enter}");
    });

    cy.dataCy("hex-value-input").should("have.focus");
    cy.dataCy("hex-value-input").type("{shift}{enter}");

    cy.dataCy("RGB-editor").within(() => {
      cy.dataCy("B-value-input").should("have.focus");
      cy.dataCy("B-value-input").type("{esc}");
      cy.dataCy("B-value-input").should("not.have.focus");
    });
  });

  it("can change color values", () => {
    cy.dataCy("RGB-editor").within(() => {
      cy.dataCy("R-value-input").type("120");
      cy.dataCy("G-value-input").type("60");
      cy.dataCy("B-value-input").type("220");
    });

    cy.dataCy("hex-value-input").should("have.value", "#783CDC");
  });
});
