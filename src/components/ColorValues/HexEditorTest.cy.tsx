import { useReducer } from "react";

import { Color } from "colorlib";

import { colorReducer, createColorActions } from "@hooks/color";

import { HexEditor } from "./ValueEditor";

const initialState = {
  color: Color.from_hex("000"),
};

function TestWrapper() {
  const [state, dispatch] = useReducer(colorReducer, initialState);
  const actions = createColorActions(dispatch);

  return (
    <div>
      <HexEditor color={state.color.hex} actions={actions.hex} />
      <p>
        Color: #<span data-cy="current-color">{state.color.hex.to_code()}</span>
      </p>
    </div>
  );
}

describe("hex editor tests", () => {
  it("edits the hex value", () => {
    cy.mount(<TestWrapper />);

    // Verify initial state
    cy.dataCy("current-color").as("color").should("have.text", "000000");

    // Should select text on focus
    cy.dataCy("hex-value-input")
      .as("value")
      .focus()
      .should("have.prop", "selectionStart", 0)
      .should("have.prop", "selectionEnd")
      .should("be.gt", 0);

    // Hex short code should be maintained while editing
    cy.get("@value").type("{rightArrow}").type("{backspace}");
    cy.get("@value").should("have.value", "#00000");
    cy.get("@color").should("have.text", "000000");

    cy.get("@value").type("{backspace}").type("{backspace}");
    cy.get("@value").should("have.value", "#000");
    cy.get("@color").should("have.text", "000000");

    cy.get("@value").blur();
    cy.get("@value").should("have.value", "#000000");
    cy.get("@color").should("have.text", "000000");

    // Type a new value
    cy.get("@value").focus().type("{backspace}");
    cy.get("@value").should("have.value", "");
    cy.get("@color").should("have.text", "000000");

    cy.get("@value").type("ab");
    cy.get("@value").should("have.value", "ab");
    cy.get("@color").should("have.text", "000000");

    cy.get("@value").type("c");
    cy.get("@value").should("have.value", "#ABC");
    cy.get("@color").should("have.text", "AABBCC");

    cy.get("@value").blur();
    cy.get("@value").should("have.value", "#AABBCC");
    cy.get("@color").should("have.text", "AABBCC");

    // Invalid blur resets to last valid color
    cy.get("@value").focus().type("Invalid");
    cy.get("@value").blur();
    cy.get("@value").should("have.value", "#AABBCC");
    cy.get("@color").should("have.text", "AABBCC");

    // Escape blurs input
    cy.get("@value").focus();
    cy.get("@value").should("have.focus");
    cy.get("@value").type("{esc}");
    cy.get("@value").should("not.have.focus");
  });
});
