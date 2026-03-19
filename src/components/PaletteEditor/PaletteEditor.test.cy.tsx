import { useReducer } from "react";

import { Color } from "colorlib";

import { HexEditor } from "@/components/ColorValues/ValueEditor";
import { colorReducer, createColorActions } from "@/hooks/color";

import PaletteEditor from "./PaletteEditor";

const initialState = {
  color: Color.from_hex("000"),
};

function TestWrapper() {
  const [state, dispatch] = useReducer(colorReducer, initialState);
  const actions = createColorActions(dispatch);

  return (
    <>
      <div style={{ width: "100%", height: 400 }}>
        <PaletteEditor
          pickerColor={state.color.hex}
          setPickerColor={actions.hex.setHex}
        />
      </div>
      <HexEditor color={state.color.hex} actions={actions.hex} />
    </>
  );
}

describe("palette editor tests", () => {
  beforeEach(() => {
    cy.mount(<TestWrapper />);
  });

  it("renders the palette editor", () => {
    cy.dataCy("palette-editor").should("exist");
  });
});
