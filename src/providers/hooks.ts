import { useContext } from "react";
import { MediaQueryContext } from "./MediaQueryProvider";

function useMediaQuery() {
  const context = useContext(MediaQueryContext);
  if (context === undefined) {
    throw new Error("useMediaQuery must be used within a MediaQueryProvider");
  }
  return context;
}

export { useMediaQuery };
