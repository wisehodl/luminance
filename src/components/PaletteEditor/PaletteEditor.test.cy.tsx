import { useReducer } from "react";

import { Color, Hex as HexColor } from "colorlib";

import { HexEditor } from "@/components/ColorValues/ValueEditor";
import { colorReducer, createColorActions } from "@/hooks/color";
import type { PaletteCardState } from "@/hooks/paletteCard";

import PaletteEditor from "./PaletteEditor";

const initialPickerState = {
  color: Color.from_hex("000"),
};

const defaultPaletteCard = {
  id: "card_id",
  name: "Test Palette",
  colors: [
    { id: "red", name: "Red", hex: HexColor.from_code("FF0000") },
    { id: "green", name: "Green", hex: HexColor.from_code("00FF00") },
    { id: "blue", name: "Blue", hex: HexColor.from_code("0000FF") },
  ],
  selectedColorIds: [],
};

const defaultPaletteCardState = {
  present: defaultPaletteCard,
  history: [],
  future: [],
};

function TestWrapper({
  initialCardState,
}: {
  initialCardState?: PaletteCardState;
}) {
  const [state, dispatch] = useReducer(colorReducer, initialPickerState);
  const actions = createColorActions(dispatch);

  return (
    <>
      <div style={{ width: "100%", height: 400 }}>
        <PaletteEditor
          pickerColor={state.color.hex}
          setPickerColor={actions.hex.setHex}
          initialCardState={initialCardState}
        />
      </div>
      <HexEditor color={state.color.hex} actions={actions.hex} />
    </>
  );
}

it("can edit the palette header", () => {
  cy.mount(<TestWrapper />);

  cy.dataCy("card-header").as("header");
  cy.dataCy("card-name").as("name").contains("New Palette");

  // Edit the name
  cy.dataCy("card-name-edit").as("edit").click();
  cy.dataCy("card-name-input")
    .as("input")
    .should("exist")
    .should("be.focused")
    .type("Summer Colors")
    .wait(0);

  cy.dataCy("card-name-confirm").as("confirm").click();
  cy.get("@name").contains("Summer Colors");

  // Edit, then cancel
  cy.get("@edit").click();
  cy.get("@input").type("Winter Colors").wait(0);

  cy.dataCy("card-name-cancel").as("cancel").click();
  cy.get("@name").contains("Summer Colors");

  // Enter should confirm
  cy.get("@edit").click();
  cy.get("@input").type("Winter Colors").type("{enter}").wait(0);
  cy.get("@name").contains("Winter Colors");

  // Escape should cancel
  cy.get("@edit").click();
  cy.get("@input").type("Fall Colors").type("{esc}").wait(0);
  cy.get("@name").contains("Winter Colors");

  // Input contents should reset
  cy.get("@edit").click();
  cy.get("@input").should("contain.text", "Winter Colors");
});

it("can perform actions in normal mode", () => {
  cy.mount(<TestWrapper />);

  // Empty palette renders no rows
  cy.dataCy("palette").as("palette").contains("No colors in palette.");
  cy.dataCy("delete").should("be.disabled");
  cy.dataCy("duplicate").should("be.disabled");

  // Add a color
  cy.dataCy("add").as("add").click();
  cy.dataCy("palette-row-0").as("row0").should("exist");
  cy.get("@row0").contains("New Color");
  cy.get("@row0").contains("#000000");

  // Select the color
  cy.get("@row0").click().should("have.attr", "aria-selected", "true");
  cy.dataCy("selected-preview")
    .as("preview")
    .should("have.css", "background-color", "rgb(0, 0, 0)");

  // Change the color name and value
  cy.dataCy("palette-row-name-0-edit").click();
  cy.dataCy("palette-row-name-0-input").type("Red{enter}").wait(0);
  cy.dataCy("palette-row-hex-0-edit").click();
  cy.dataCy("palette-row-hex-0-input").type("F00{enter}").wait(0);
  cy.get("@row0").contains("Red");
  cy.get("@row0").contains("#FF0000");
  cy.get("@preview").should("have.css", "background-color", "rgb(255, 0, 0)");

  // Add a second color
  cy.get("@add").click();
  cy.dataCy("palette-row-1").as("row1").should("exist");

  // Selecting the second deselects the first
  cy.get("@row1").click().should("have.attr", "aria-selected", "true");
  cy.get("@row0").should("have.attr", "aria-selected", "false");

  // Select none
  cy.get("@row1").click("top");

  // Delete and Duplicate should be disabled
  cy.dataCy("delete").as("delete").should("be.disabled");
  cy.dataCy("duplicate").as("duplicate").should("be.disabled");

  // Delete the first row
  cy.get("@row0").click();
  cy.get("@delete").click();

  // Second row becomes first
  cy.get("@row0").contains("New Color");

  // Duplicate a color
  cy.get("@add").click();
  cy.get("@row0").click();
  cy.dataCy("palette-row-name-0-edit").click();
  cy.dataCy("palette-row-name-0-input").type("Red{enter}").wait(0);
  cy.dataCy("palette-row-hex-0-edit").click();
  cy.dataCy("palette-row-hex-0-input").type("F00{enter}").wait(0);

  // Dupliated color appears below selected row
  cy.get("@duplicate").click();
  cy.get("@row0").contains("#FF0000");
  cy.get("@row1").contains("#FF0000");
  cy.dataCy("palette-row-2").as("row2").contains("#000000");

  // Undo removes duplicate
  cy.dataCy("redo").as("redo").should("be.disabled");
  cy.dataCy("undo").as("undo").should("be.enabled").click();

  cy.get("@row0").contains("#FF0000");
  cy.get("@row1").contains("#000000");

  // Redo adds duplicate back
  cy.get("@redo").click();
  cy.get("@row0").contains("#FF0000");
  cy.get("@row1").contains("#FF0000");
  cy.get("@row2").contains("#000000");
});

it.only("can manually sync picker and palette", () => {
  cy.mount(<TestWrapper initialCardState={defaultPaletteCardState} />);

  cy.dataCy("hex-value-input").as("hex");
  cy.dataCy("picker-preview").as("picker");
  cy.dataCy("selected-preview").as("palette");
  cy.dataCy("palette-row-0").as("row0");
  cy.dataCy("palette-row-1").as("row1");
  cy.dataCy("palette-row-2").as("row2");

  // Ensure picker and preview colors are set to default
  cy.get("@hex").should("have.value", "#000000");
  cy.get("@picker").should("have.css", "background-color", "rgb(0, 0, 0)");

  // Clicking the picker when no colors are selected does nothing
  cy.get("@picker").click();

  // Select a color and sync it to the picker
  cy.get("@row1").click();
  cy.get("@palette").should("have.css", "background-color", "rgb(0, 255, 0)");
  cy.get("@picker")
    .click()
    .should("have.css", "background-color", "rgb(0, 255, 0)");
  cy.get("@hex").should("have.value", "#00FF00");

  // Select a new color, picker remains the same
  cy.get("@row0").click();
  cy.get("@palette").should("have.css", "background-color", "rgb(255, 0, 0)");
  cy.get("@picker").should("have.css", "background-color", "rgb(0, 255, 0)");

  // Change picker color, sync back to palette.
  cy.get("@hex").focus().type("FFFF00{esc}").wait(0);
  cy.get("@picker").should("have.css", "background-color", "rgb(255, 255, 0)");
  cy.get("@palette").click();
  cy.get("@row0").contains("#FFFF00");
});

it("can automatically sync picker and palette", () => {
  cy.clock();
  cy.mount(<TestWrapper initialCardState={defaultPaletteCardState} />);

  cy.dataCy("undo").as("undo");
  cy.dataCy("redo").as("redo");
  cy.dataCy("sync").as("sync");
  cy.dataCy("hex-value-input").as("hex");
  cy.dataCy("picker-preview").as("picker");
  cy.dataCy("selected-preview").as("palette");
  cy.dataCy("palette-row-0").as("row0");
  cy.dataCy("palette-row-1").as("row1");
  cy.dataCy("palette-row-2").as("row2");

  // Enable color sync
  cy.get("@sync").click().should("have.attr", "aria-pressed", "true");

  // No color selected, all previews are default
  cy.get("@hex").should("have.value", "#000000");
  cy.get("@picker").should("have.css", "background-color", "rgb(0, 0, 0)");

  // Select a color, picker should sync
  cy.get("@row1").click();
  cy.get("@palette").should("have.css", "background-color", "rgb(0, 255, 0)");
  cy.get("@picker").should("have.css", "background-color", "rgb(0, 255, 0)");
  cy.get("@hex").should("have.value", "#00FF00");

  // Change picker color, palette should sync
  cy.get("@hex").type("#FF00FF{esc}").wait(0);
  cy.get("@palette").should("have.css", "background-color", "rgb(255, 0, 255)");
  cy.get("@picker").should("have.css", "background-color", "rgb(255, 0, 255)");
  cy.get("@row1").contains("#FF00FF");

  // Turning on sync mode should set picker to selected palette color
  cy.get("@sync").click();
  cy.get("@row2").click();
  cy.get("@sync").click();
  cy.get("@picker").should("have.css", "background-color", "rgb(0, 0, 255)");
  cy.get("@hex").should("have.value", "#0000FF");

  // History updates after timeout

  cy.get("@hex").type("#FF00FF{esc}").wait(0);
  cy.get("@picker").should("have.css", "background-color", "rgb(255, 0, 255)");
  cy.tick(3000);
  cy.get("@hex").type("#00FF00{esc}").wait(0);
  cy.get("@picker").should("have.css", "background-color", "rgb(0, 255, 0)");
  cy.tick(3000);

  // undo goes back to pink, then blue
  cy.get("@undo").click();
  cy.get("@palette").should("have.css", "background-color", "rgb(255, 0, 255)");
  cy.get("@picker").should("have.css", "background-color", "rgb(255, 0, 255)");
  cy.get("@hex").should("have.value", "#FF00FF");
  cy.get("@undo").click();
  cy.get("@palette").should("have.css", "background-color", "rgb(0, 0, 255)");
  cy.get("@picker").should("have.css", "background-color", "rgb(0, 0, 255)");
  cy.get("@hex").should("have.value", "#0000FF");

  // redo goes to pink, then green
  cy.get("@redo").click();
  cy.get("@palette").should("have.css", "background-color", "rgb(255, 0, 255)");
  cy.get("@picker").should("have.css", "background-color", "rgb(255, 0, 255)");
  cy.get("@redo").click();
  cy.get("@palette").should("have.css", "background-color", "rgb(0, 255, 0)");
  cy.get("@picker").should("have.css", "background-color", "rgb(0, 255, 0)");

  // undo during timeout wipes intermediate state
  cy.get("@hex").type("#0000FF{esc}").wait(0);
  cy.tick(3000); // lock in blue
  cy.get("@hex").type("#FF00FF{esc}").wait(0); // pink is debounced
  cy.get("@hex").type("#00FF00{esc}").wait(0);
  cy.tick(3000); // lock in green

  // pink state is lost, undo goes back to blue
  cy.get("@undo").click();
  cy.get("@picker").should("have.css", "background-color", "rgb(0, 0, 255)");

  cy.clock().then((clock) => clock.restore());
});

it("can perform actions in edit mode", () => {
  cy.mount(<TestWrapper initialCardState={defaultPaletteCardState} />);

  cy.dataCy("select").as("select");
  cy.dataCy("palette-row-0").as("row0");
  cy.dataCy("palette-row-1").as("row1");
  cy.dataCy("palette-row-2").as("row2");

  // enter select mode
  cy.get("@select").click().should("have.attr", "aria-pressed", "true");

  cy.dataCy("select-all").as("select-all");
  cy.dataCy("clear").as("clear");

  // select multiple colors
  cy.get("@row0").should("have.attr", "aria-selected", "false");
  cy.get("@row1").should("have.attr", "aria-selected", "false");

  cy.get("@row0").click();
  cy.get("@row1").click();

  cy.get("@row0").should("have.attr", "aria-selected", "true");
  cy.get("@row1").should("have.attr", "aria-selected", "true");

  // clear selection
  cy.get("@clear").click();
  cy.get("@row0").should("have.attr", "aria-selected", "false");
  cy.get("@row1").should("have.attr", "aria-selected", "false");

  // select all
  cy.get("@select-all").click();
  cy.get("@row0").should("have.attr", "aria-selected", "true");
  cy.get("@row1").should("have.attr", "aria-selected", "true");
  cy.get("@row2").should("have.attr", "aria-selected", "true");

  // leave select mode
  cy.get("@select").click().should("have.attr", "aria-pressed", "false");
  cy.get("@row0").should("have.attr", "aria-selected", "false");
  cy.get("@row1").should("have.attr", "aria-selected", "false");
  cy.get("@row2").should("have.attr", "aria-selected", "false");
});

it("can reorder colors in reorder mode", () => {
  cy.mount(<TestWrapper initialCardState={defaultPaletteCardState} />);

  // enter reorder mode
  cy.dataCy("reorder").click().should("have.attr", "aria-pressed", "true");

  // drag red down to green
  cy.dataCy("palette-row-0-wrapper").trigger("mousedown", {
    buttons: 1,
    eventConstructor: "MouseEvent",
  });
  cy.dataCy("palette-row-1-wrapper").trigger("mousemove", {
    buttons: 1,
    eventConstructor: "MouseEvent",
  });
  cy.dataCy("palette-row-1-wrapper").trigger("mouseup", {
    buttons: 1,
    eventConstructor: "MouseEvent",
  });

  // green should now be first
  cy.dataCy("palette-row-0").contains("Green");
  cy.dataCy("palette-row-1").contains("Red");
  cy.dataCy("palette-row-2").contains("Blue");

  // leave reorder mode
  cy.dataCy("reorder").click().should("have.attr", "aria-pressed", "false");

  // order should persist
  cy.dataCy("palette-row-0").contains("Green");
  cy.dataCy("palette-row-1").contains("Red");
  cy.dataCy("palette-row-2").contains("Blue");
});
