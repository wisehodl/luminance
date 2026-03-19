import { createContext } from "react";

import * as colorlib from "colorlib";

import type { ColorActions } from "@/hooks/color";

export enum ViewportMode {
  DESKTOP = "desktop",
  MOBILE_LANDSCAPE = "mobile-landscape",
  MOBILE_PORTRAIT = "mobile-portrait",
}

interface MediaQueryContextType {
  viewportMode: ViewportMode;
  isDesktop: boolean;
  isMobileLandscape: boolean;
  isMobilePortrait: boolean;
}

export const MediaQueryContext = createContext<
  MediaQueryContextType | undefined
>(undefined);

interface SelectedColorContextType {
  selectedColor: colorlib.Color;
  selectedColorActions: ColorActions;
}

export const SelectedColorContext = createContext<
  SelectedColorContextType | undefined
>(undefined);
