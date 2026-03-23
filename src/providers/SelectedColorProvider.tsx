import { useMemo, useReducer } from "react";
import type { ReactNode } from "react";

import * as colorlib from "colorlib";

import { colorReducer, createColorActions } from "@/hooks/color";

import { SelectedColorContext } from "./context";

export const SelectedColorProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const initialState = {
    color: colorlib.Color.from_hex("00C9FA"),
  };
  const [colorState, colorDispatch] = useReducer(colorReducer, initialState);
  const colorActions = useMemo(
    () => createColorActions(colorDispatch),
    [colorDispatch],
  );

  const value = useMemo(
    () => ({
      selectedColor: colorState.color,
      selectedColorActions: colorActions,
    }),
    [colorState.color, colorActions],
  );

  return (
    <SelectedColorContext.Provider value={value}>
      {children}
    </SelectedColorContext.Provider>
  );
};
