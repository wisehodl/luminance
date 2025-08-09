import { useContext } from "react";

import { MediaQueryContext } from "./MediaQueryProvider";
import { SelectedColorContext } from "./SelectedColorProvider";

export function useMediaQuery() {
  const context = useContext(MediaQueryContext);
  if (context === undefined) {
    throw new Error("useMediaQuery must be used within a MediaQueryProvider");
  }
  return context;
}

export function useSelectedColor() {
  const context = useContext(SelectedColorContext);
  if (!context) {
    throw new Error("useColor must be used within a ColorProvider");
  }
  return context;
}
