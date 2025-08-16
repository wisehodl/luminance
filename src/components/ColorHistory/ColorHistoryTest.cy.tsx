import { useReducer, useState } from "react";
import type { ChangeEvent } from "react";

import { Color } from "colorlib";

import { colorReducer, createColorActions } from "@/hooks/color";

import { HexEditor } from "../ColorValues/ValueEditor";
import ColorHistory from "./ColorHistory";

const initialState = {
  color: Color.from_hex("000"),
};

function TestWrapper() {
  const [state, dispatch] = useReducer(colorReducer, initialState);
  const actions = createColorActions(dispatch);

  const [disabled, setDisabled] = useState(false);
  const handleDisabledChange = (e: ChangeEvent<HTMLInputElement>) =>
    setDisabled(e.target.checked);

  return (
    <div>
      <ColorHistory
        color={state.color}
        setColor={actions.common.setColor}
        disabled={disabled}
      />
      <HexEditor color={state.color.hex} actions={actions.hex} />
      <label>
        <input
          data-cy="disabled-checkbox"
          type="checkbox"
          checked={disabled}
          onChange={handleDisabledChange}
        />
        Disabled
      </label>
    </div>
  );
}

describe("color history", () => {
  beforeEach(() => {
    cy.disableTransitions();
    cy.clock();
    cy.mount(<TestWrapper />);
  });

  afterEach(() => {
    cy.clock().then((clock) => clock.restore());
    cy.enableTransitions();
  });

  it("adds stable color values after 1 second", () => {
    // add stable values to history
    cy.dataCy("hex-value-input").as("value").clear().type("#00F536");
    cy.tick(1000);

    cy.dataCy("color-history").children().should("have.length", 1);
    cy.dataCy("history-color-0").should(
      "have.css",
      "background-color",
      "rgb(0, 245, 54)",
    );

    cy.get("@value").clear().type("#E23AEC");
    cy.tick(1000);

    cy.dataCy("color-history").children().should("have.length", 2);
    cy.dataCy("history-color-0").should(
      "have.css",
      "background-color",
      "rgb(226, 58, 236)",
    );

    // click to restore value
    cy.dataCy("history-color-1").click();
    cy.get("@value").should("have.value", "#00F536");

    // disable history
    cy.dataCy("disabled-checkbox").click();
    cy.get("@value").clear().type("#00C3EE");
    cy.tick(1000);

    cy.dataCy("color-history").children().should("have.length", 2);

    // re-enable history
    cy.dataCy("disabled-checkbox").click();
    cy.tick(1000);

    cy.dataCy("color-history").children().should("have.length", 3);
  });
});
