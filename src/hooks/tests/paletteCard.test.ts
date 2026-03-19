import { Hex as HexColor } from "colorlib";
import { beforeEach, describe, expect, test } from "vitest";

import { mockUseReducer } from "@/testUtil";

import type {
  PaletteCard,
  PaletteCardAction,
  PaletteCardActions,
  PaletteCardState,
} from "../paletteCard";
import { createPaletteCardActions, paletteCardReducer } from "../paletteCard";

const createPaletteState = (
  present: PaletteCard,
  history: PaletteCard[] = [],
  future: PaletteCard[] = [],
) => ({ present: { ...present }, history, future });

const testPaletteCard = {
  id: "palette_id",
  name: "Test Palette",
  colors: [],
  selectedColorId: null,
  inToolkitMode: false,
};
const testState = createPaletteState(testPaletteCard);

const WHITE = HexColor.from_code("#fff");
const GREY = HexColor.from_code("#777");
const BLACK = HexColor.from_code("#000");

describe("palette card actions", () => {
  let state: PaletteCardState;
  let dispatch: (value: PaletteCardAction) => void;
  let actions: PaletteCardActions;

  beforeEach(() => {
    [state, dispatch] = mockUseReducer(paletteCardReducer, testState);
    actions = createPaletteCardActions(dispatch);
  });

  test("sets card name", () => {
    actions.setCardName("New Name");
    expect(state.present.name).toBe("New Name");

    expect(state.history.length).toBe(1);
    expect(state.future.length).toBe(0);

    expect(state.history[0].name).toBe("Test Palette");
  });
});
