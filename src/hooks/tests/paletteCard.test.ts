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

// Fixtures

const makeColor = (id: string, hex = "000000") => ({
  id,
  name: `Color ${id}`,
  hex: HexColor.from_code(hex),
});

const makeCard = (overrides: Partial<PaletteCard> = {}): PaletteCard => ({
  id: "card_1",
  name: "Test Palette",
  colors: [],
  selectedColorIds: [],
  ...overrides,
});

const makeState = (
  present: PaletteCard,
  history: PaletteCard[] = [],
  future: PaletteCard[] = [],
): PaletteCardState => ({ present, history, future });

const emptyState = makeState(makeCard());

const seededState = makeState(
  makeCard({
    colors: [makeColor("a"), makeColor("b"), makeColor("c")],
  }),
);

// Helpers

let state: PaletteCardState;
let dispatch: (value: PaletteCardAction) => void;
let actions: PaletteCardActions;

const setup = (initial: PaletteCardState) => {
  [state, dispatch] = mockUseReducer(paletteCardReducer, initial);
  actions = createPaletteCardActions(dispatch);
};

// Tests

describe("set card name", () => {
  beforeEach(() => {
    setup(emptyState);
  });

  test("updates name", () => {
    actions.setCardName("New Name");
    expect(state.present.name).toBe("New Name");
  });

  test("pushes to history", () => {
    actions.setCardName("New Name");
    expect(state.history.length).toBe(1);
    expect(state.history[0].name).toBe("Test Palette");
  });

  test("clears future", () => {
    const withFuture = makeState(
      makeCard(),
      [],
      [makeCard({ name: "Future" })],
    );
    setup(withFuture);
    actions.setCardName("New Name");
    expect(state.future.length).toBe(0);
  });
});

describe("SET_COLOR_NAME", () => {
  beforeEach(() => setup(seededState));

  test("updates name of the target color", () => {
    actions.setColorName("b", "New Name");
    expect(state.present.colors.find((c) => c.id === "b")?.name).toBe(
      "New Name",
    );
  });

  test("does not affect other colors", () => {
    actions.setColorName("b", "New Name");
    expect(state.present.colors.find((c) => c.id === "a")?.name).toMatch(
      /Color [a-z]/,
    );
  });

  test("pushes to history", () => {
    actions.setColorName("b", "New Name");
    expect(state.history.length).toBe(1);
  });

  test("unknown id is a no-op", () => {
    actions.setColorName("z", "New Name");
    expect(state.present.colors.map((c) => c.name)).toEqual([
      "Color a",
      "Color b",
      "Color c",
    ]);
    expect(state.history.length).toBe(0);
  });
});

describe("SET_COLOR_VALUE", () => {
  beforeEach(() => setup(seededState));

  test("updates hex of the target color", () => {
    actions.setColorValue("b", HexColor.from_code("FF0000"));
    expect(state.present.colors.find((c) => c.id === "b")?.hex.to_code()).toBe(
      "FF0000",
    );
  });

  test("does not affect other colors", () => {
    actions.setColorValue("b", HexColor.from_code("FF0000"));
    expect(state.present.colors.find((c) => c.id === "a")?.hex.to_code()).toBe(
      "000000",
    );
  });

  test("pushes to history", () => {
    actions.setColorValue("b", HexColor.from_code("FF0000"));
    expect(state.history.length).toBe(1);
  });

  test("unknown id is a no-op", () => {
    actions.setColorValue("z", HexColor.from_code("FF0000"));
    expect(state.present.colors.map((c) => c.hex.to_code())).toEqual([
      "000000",
      "000000",
      "000000",
    ]);
    expect(state.history.length).toBe(0);
  });
});

describe("SET_COLOR_VALUE_SILENT", () => {
  beforeEach(() => setup(seededState));

  test("updates hex of the target color", () => {
    actions.setColorValueSilent("b", HexColor.from_code("FF0000"));
    expect(state.present.colors.find((c) => c.id === "b")?.hex.to_code()).toBe(
      "FF0000",
    );
  });

  test("does not affect other colors", () => {
    actions.setColorValueSilent("b", HexColor.from_code("FF0000"));
    expect(state.present.colors.find((c) => c.id === "a")?.hex.to_code()).toBe(
      "000000",
    );
  });

  test("does not push to history", () => {
    actions.setColorValueSilent("b", HexColor.from_code("FF0000"));
    expect(state.history.length).toBe(0);
  });

  test("unknown id is a no-op", () => {
    actions.setColorValueSilent("z", HexColor.from_code("FF0000"));
    expect(state.present.colors.map((c) => c.hex.to_code())).toEqual([
      "000000",
      "000000",
      "000000",
    ]);
    expect(state.history.length).toBe(0);
  });
});

describe("COMMIT_TO_HISTORY", () => {
  beforeEach(() => setup(seededState));

  test("appends to history without affecting present", () => {
    const cachedState = makeCard({ id: "cached", name: "Cached Card" });
    expect(state.history.length).toBe(0);
    actions.commitToHistory(cachedState);
    expect(state.history.length).toBe(1);
    expect(state.present.id).toBe("card_1");
    expect(state.history[0].id).toBe("cached");
  });
});

describe("selection", () => {
  beforeEach(() => {
    setup(seededState);
  });

  test("SET_SELECTED_COLORS replaces selection", () => {
    actions.setSelectedColors(["a", "b"]);
    expect(state.present.selectedColorIds).toEqual(["a", "b"]);
  });

  test("SET_SELECTED_COLORS with empty array clears selection", () => {
    actions.setSelectedColors(["a"]);
    actions.setSelectedColors([]);
    expect(state.present.selectedColorIds).toEqual([]);
  });

  test("SELECT_ALL selects all color ids", () => {
    actions.selectAll();
    expect(state.present.selectedColorIds).toEqual(["a", "b", "c"]);
  });

  test("SELECT_ALL on empty colors produces empty selection", () => {
    setup(emptyState);
    actions.selectAll();
    expect(state.present.selectedColorIds).toEqual([]);
  });

  test("CLEAR_SELECTION empties a non-empty selection", () => {
    actions.setSelectedColors(["a", "b"]);
    actions.clearSelection();
    expect(state.present.selectedColorIds).toEqual([]);
  });

  test("selection actions do not push to history", () => {
    actions.setSelectedColors(["a"]);
    actions.selectAll();
    actions.clearSelection();
    expect(state.history.length).toBe(0);
  });
});

describe("add colors", () => {
  test("appends one color", () => {
    setup(seededState);
    actions.addColor();
    expect(state.present.colors.length).toBe(4);
  });

  test("on empty card produces one color", () => {
    setup(emptyState);
    actions.addColor();
    expect(state.present.colors.length).toBe(1);
  });

  test("new color has a non-empty id", () => {
    setup(emptyState);
    actions.addColor();
    expect(state.present.colors[0].id).toBeTruthy();
  });

  test("pushes to history", () => {
    setup(emptyState);
    actions.addColor();
    expect(state.history.length).toBe(1);
  });
});

describe("reorder colors", () => {
  beforeEach(() => setup(seededState));

  test("replaces colors array", () => {
    const reordered = [makeColor("c"), makeColor("a"), makeColor("b")];
    actions.reorderColors(reordered);
    expect(state.present.colors.map((c) => c.id)).toEqual(["c", "a", "b"]);
  });

  test("pushes to history", () => {
    actions.reorderColors([makeColor("c"), makeColor("b"), makeColor("a")]);
    expect(state.history.length).toBe(1);
  });

  test("does not affect selection", () => {
    actions.setSelectedColors(["a"]);
    actions.reorderColors([makeColor("c"), makeColor("b"), makeColor("a")]);
    expect(state.present.selectedColorIds).toEqual(["a"]);
  });
});

describe("delete colors", () => {
  beforeEach(() => setup(seededState));

  test("removes exactly the selected colors", () => {
    actions.setSelectedColors(["a", "c"]);
    actions.deleteSelectedColors();
    expect(state.present.colors.map((c) => c.id)).toEqual(["b"]);
  });

  test("clears selection afterward", () => {
    actions.setSelectedColors(["a"]);
    actions.deleteSelectedColors();
    expect(state.present.selectedColorIds).toEqual([]);
  });

  test("pushes one history entry", () => {
    actions.setSelectedColors(["a"]);
    actions.deleteSelectedColors();
    expect(state.history.length).toBe(1);
  });

  test("with empty selection is a no-op", () => {
    actions.deleteSelectedColors();
    expect(state.present.colors.length).toBe(3);
    expect(state.history.length).toBe(0);
  });
});

describe("duplicate colors", () => {
  beforeEach(() => setup(seededState));

  test("appends copies after their originals", () => {
    actions.setSelectedColors(["b"]);
    actions.duplicateSelectedColors();
    const ids = state.present.colors.map((c) => c.id);
    expect(ids[0]).toBe("a");
    expect(ids[1]).toBe("b");
    expect(ids[2]).not.toBe("b"); // new id
    expect(ids[3]).toBe("c");
    expect(ids.length).toBe(4);
  });

  test("duplicate has the same color value", () => {
    actions.setSelectedColors(["a"]);
    actions.duplicateSelectedColors();
    const colors = state.present.colors.map((c) => c.hex);
    expect(colors[0]).toBe(colors[1]);
  });

  test("duplicates have new ids", () => {
    actions.setSelectedColors(["a", "b", "c"]);
    actions.duplicateSelectedColors();
    const ids = state.present.colors.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(6);
  });

  test("maintains selection", () => {
    actions.setSelectedColors(["a"]);
    actions.duplicateSelectedColors();
    expect(state.present.selectedColorIds).toEqual(["a"]);
  });

  test("pushes one history entry", () => {
    actions.setSelectedColors(["a"]);
    actions.duplicateSelectedColors();
    expect(state.history.length).toBe(1);
  });

  test("preserves relative order of non-duplicated colors", () => {
    actions.setSelectedColors(["a"]);
    actions.duplicateSelectedColors();
    const ids = state.present.colors.map((c) => c.id);
    expect(ids.indexOf("b")).toBeLessThan(ids.indexOf("c"));
  });

  test("with empty selection is a no-op", () => {
    actions.duplicateSelectedColors();
    expect(state.present.colors.length).toBe(3);
    expect(state.history.length).toBe(0);
  });
});

describe("undo / redo", () => {
  beforeEach(() => setup(emptyState));

  test("UNDO restores previous present", () => {
    actions.setCardName("A");
    actions.setCardName("B");
    actions.undo();
    expect(state.present.name).toBe("A");
  });

  test("UNDO pushes current present to future", () => {
    actions.setCardName("A");
    actions.undo();
    expect(state.future[0].name).toBe("A");
  });

  test("UNDO at empty history is a no-op", () => {
    actions.undo();
    expect(state.present.name).toBe("Test Palette");
    expect(state.history.length).toBe(0);
  });

  test("REDO restores next future", () => {
    actions.setCardName("A");
    actions.undo();
    actions.redo();
    expect(state.present.name).toBe("A");
  });

  test("REDO pushes current present to history", () => {
    actions.setCardName("A");
    actions.undo();
    actions.redo();
    expect(state.history[0].name).toBe("Test Palette");
  });

  test("REDO at empty future is a no-op", () => {
    actions.setCardName("A");
    actions.redo();
    expect(state.present.name).toBe("A");
    expect(state.future.length).toBe(0);
  });

  test("mutation after undo clears future", () => {
    actions.setCardName("A");
    actions.undo();
    actions.setCardName("B");
    expect(state.future.length).toBe(0);
  });
});
