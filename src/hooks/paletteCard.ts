import type { Dispatch } from "react";

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
}

export interface PaletteCard {
  id: string;
  name: string;
  colors: PaletteColor[];
  selectedColorId: string | null;
  inToolkitMode: boolean;
}

export interface PaletteCardState {
  present: PaletteCard;
  history: PaletteCard[];
  future: PaletteCard[];
}

export type PaletteCardAction =
  | { type: "SET_CARD_NAME"; payload: string }
  | { type: "SET_SELECTED_COLOR"; payload: string | null }
  | { type: "ADD_COLOR" }
  | { type: "DELETE_SELECTED_COLOR" }
  | { type: "DUPLICATE_SELECTED_COLOR" }
  | { type: "REORDER_COLORS"; payload: PaletteColor[] }
  | { type: "TOGGLE_TOOLKIT_MODE" }
  | { type: "UNDO" }
  | { type: "REDO" };

export function paletteCardReducer(
  state: PaletteCardState,
  action: PaletteCardAction,
): PaletteCardState {
  const pushToHistory = (state: PaletteCardState, newPresent: PaletteCard) => {
    return {
      ...state,
      history: [state.present, ...state.history],
      future: [],
      present: newPresent,
    };
  };

  switch (action.type) {
    case "SET_CARD_NAME":
      state = pushToHistory(state, { ...state.present, name: action.payload });
      return state;

    case "SET_SELECTED_COLOR":
      // TODO: Implement
      return state;

    case "ADD_COLOR":
      // TODO: Implement
      return state;

    case "DELETE_SELECTED_COLOR":
      // TODO: Implement
      return state;

    case "DUPLICATE_SELECTED_COLOR":
      // TODO: Implement
      return state;

    case "REORDER_COLORS":
      // TODO: Implement
      return state;

    case "TOGGLE_TOOLKIT_MODE":
      // TODO: Implement
      return state;

    case "UNDO":
      // TODO: Implement
      return state;

    case "REDO":
      // TODO: Implement
      return state;

    default:
      return state;
  }
}

export interface PaletteCardActions {
  setCardName: (name: string) => void;
  setSelectedColor: (id: string | null) => void;
  addColor: () => void;
  deleteSelectedColor: () => void;
  duplicateSelectedColor: () => void;
  reorderColors: (colors: PaletteColor[]) => void;
  toggleToolkitMode: () => void;
  undo: () => void;
  redo: () => void;
}

export function createPaletteCardActions(
  dispatch: Dispatch<PaletteCardAction>,
): PaletteCardActions {
  return {
    setCardName: (name) => dispatch({ type: "SET_CARD_NAME", payload: name }),
    setSelectedColor: (id) =>
      dispatch({ type: "SET_SELECTED_COLOR", payload: id }),
    addColor: () => dispatch({ type: "ADD_COLOR" }),
    deleteSelectedColor: () => dispatch({ type: "DELETE_SELECTED_COLOR" }),
    duplicateSelectedColor: () =>
      dispatch({ type: "DUPLICATE_SELECTED_COLOR" }),
    reorderColors: (colors) =>
      dispatch({ type: "REORDER_COLORS", payload: colors }),
    toggleToolkitMode: () => dispatch({ type: "TOGGLE_TOOLKIT_MODE" }),
    undo: () => dispatch({ type: "UNDO" }),
    redo: () => dispatch({ type: "REDO" }),
  };
}
