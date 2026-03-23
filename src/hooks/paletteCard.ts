import type { Dispatch } from "react";

import { Hex as HexColor } from "colorlib";

import { randomId } from "@/util";

export type PaletteMode = "normal" | "select" | "reorder";

export interface PaletteColor {
  id: string;
  name: string;
  hex: HexColor;
}

export interface ColorNameUpdate {
  id: string;
  name: string;
}

export interface ColorValueUpdate {
  id: string;
  hex: HexColor;
}

export interface PaletteCard {
  id: string;
  name: string;
  colors: PaletteColor[];
  selectedColorIds: string[];
}

export interface PaletteCardState {
  present: PaletteCard;
  history: PaletteCard[];
  future: PaletteCard[];
}

export type PaletteCardAction =
  | { type: "SET_CARD_NAME"; payload: string }
  | { type: "SET_COLOR_NAME"; payload: ColorNameUpdate }
  | { type: "SET_COLOR_VALUE"; payload: ColorValueUpdate }
  | { type: "SET_COLOR_VALUE_SILENT"; payload: ColorValueUpdate }
  | { type: "COMMIT_TO_HISTORY"; payload: PaletteCard }
  | { type: "SET_SELECTED_COLORS"; payload: string[] }
  | { type: "SELECT_ALL" }
  | { type: "CLEAR_SELECTION" }
  | { type: "DELETE_SELECTED_COLORS" }
  | { type: "DUPLICATE_SELECTED_COLORS" }
  | { type: "ADD_COLOR" }
  | { type: "REORDER_COLORS"; payload: PaletteColor[] }
  | { type: "UNDO" }
  | { type: "REDO" };

const pushToHistory = (state: PaletteCardState, newPresent: PaletteCard) => {
  return {
    ...state,
    history: [state.present, ...state.history],
    future: [],
    present: newPresent,
  };
};

export function paletteCardReducer(
  state: PaletteCardState,
  action: PaletteCardAction,
): PaletteCardState {
  switch (action.type) {
    case "SET_CARD_NAME":
      state = pushToHistory(state, { ...state.present, name: action.payload });
      return state;

    case "SET_COLOR_NAME": {
      let changed = false;
      const colors = state.present.colors.map((c) => {
        if (c.id !== action.payload.id) return c;
        changed = true;
        return { ...c, name: action.payload.name };
      });
      if (!changed) return state;
      return pushToHistory(state, { ...state.present, colors });
    }

    case "SET_COLOR_VALUE": {
      let changed = false;
      const colors = state.present.colors.map((c) => {
        if (c.id !== action.payload.id) return c;
        changed = true;
        return { ...c, hex: action.payload.hex };
      });
      if (!changed) return state;
      return pushToHistory(state, { ...state.present, colors });
    }

    case "SET_COLOR_VALUE_SILENT": {
      let changed = false;
      const colors = state.present.colors.map((c) => {
        if (c.id !== action.payload.id) return c;
        changed = true;
        return { ...c, hex: action.payload.hex };
      });
      if (!changed) return state;
      return {
        ...state,
        present: { ...state.present, colors },
      };
    }

    case "COMMIT_TO_HISTORY": {
      return {
        ...state,
        history: [action.payload, ...state.history],
      };
    }

    case "SET_SELECTED_COLORS":
      return {
        ...state,
        present: { ...state.present, selectedColorIds: action.payload },
      };

    case "SELECT_ALL":
      return {
        ...state,
        present: {
          ...state.present,
          selectedColorIds: state.present.colors.map((c) => c.id),
        },
      };

    case "CLEAR_SELECTION":
      return {
        ...state,
        present: { ...state.present, selectedColorIds: [] },
      };

    case "ADD_COLOR": {
      const newColor: PaletteColor = {
        id: randomId(),
        name: "New Color",
        hex: HexColor.from_code("000000"),
      };
      return pushToHistory(state, {
        ...state.present,
        colors: [...state.present.colors, newColor],
      });
    }

    case "DELETE_SELECTED_COLORS": {
      if (state.present.selectedColorIds.length === 0) return state;
      const ids = new Set(state.present.selectedColorIds);
      return pushToHistory(state, {
        ...state.present,
        colors: state.present.colors.filter((c) => !ids.has(c.id)),
        selectedColorIds: [],
      });
    }

    case "DUPLICATE_SELECTED_COLORS": {
      if (state.present.selectedColorIds.length === 0) return state;
      const ids = new Set(state.present.selectedColorIds);
      const next: PaletteColor[] = [];
      for (const color of state.present.colors) {
        next.push(color);
        if (ids.has(color.id)) {
          next.push({ ...color, id: randomId() });
        }
      }
      return pushToHistory(state, {
        ...state.present,
        colors: next,
      });
    }

    case "REORDER_COLORS":
      return pushToHistory(state, {
        ...state.present,
        colors: action.payload,
      });

    case "UNDO": {
      if (state.history.length === 0) return state;
      const [prev, ...rest] = state.history;
      return {
        present: prev,
        history: rest,
        future: [state.present, ...state.future],
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        present: next,
        history: [state.present, ...state.history],
        future: rest,
      };
    }

    default:
      return state;
  }
}

export interface PaletteCardActions {
  setCardName: (name: string) => void;
  setColorName: (id: string, name: string) => void;
  setColorValue: (id: string, hex: HexColor) => void;
  setColorValueSilent: (id: string, hex: HexColor) => void;
  commitToHistory: (card: PaletteCard) => void;
  setSelectedColors: (id: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  addColor: () => void;
  deleteSelectedColors: () => void;
  duplicateSelectedColors: () => void;
  reorderColors: (colors: PaletteColor[]) => void;
  undo: () => void;
  redo: () => void;
}

export function createPaletteCardActions(
  dispatch: Dispatch<PaletteCardAction>,
): PaletteCardActions {
  return {
    setCardName: (name) => dispatch({ type: "SET_CARD_NAME", payload: name }),
    setColorName: (id, name) =>
      dispatch({ type: "SET_COLOR_NAME", payload: { id, name } }),
    setColorValue: (id, hex) =>
      dispatch({ type: "SET_COLOR_VALUE", payload: { id, hex } }),
    setColorValueSilent: (id, hex) =>
      dispatch({ type: "SET_COLOR_VALUE_SILENT", payload: { id, hex } }),
    commitToHistory: (card) =>
      dispatch({ type: "COMMIT_TO_HISTORY", payload: card }),
    setSelectedColors: (ids) =>
      dispatch({ type: "SET_SELECTED_COLORS", payload: ids }),
    selectAll: () => dispatch({ type: "SELECT_ALL" }),
    clearSelection: () => dispatch({ type: "CLEAR_SELECTION" }),
    addColor: () => dispatch({ type: "ADD_COLOR" }),
    deleteSelectedColors: () => dispatch({ type: "DELETE_SELECTED_COLORS" }),
    duplicateSelectedColors: () =>
      dispatch({ type: "DUPLICATE_SELECTED_COLORS" }),
    reorderColors: (colors) =>
      dispatch({ type: "REORDER_COLORS", payload: colors }),
    undo: () => dispatch({ type: "UNDO" }),
    redo: () => dispatch({ type: "REDO" }),
  };
}
