import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { MediaQueryContext, ViewportMode } from "./context";

export const MediaQueryProvider = ({ children }: { children: ReactNode }) => {
  const [viewportMode, setViewportMode] = useState<ViewportMode>(
    ViewportMode.DESKTOP,
  );

  useEffect(() => {
    const desktopQuery = window.matchMedia(
      "(min-width: 992px), (min-width: 568px) and (max-width: 991px) and (orientation: portrait)",
    );
    const mobileLandscapeQuery = window.matchMedia(
      "(min-width: 568px) and (max-width: 991px) and (orientation: landscape)",
    );
    const mobilePortraitQuery = window.matchMedia("(max-width: 567px)");

    const updateViewportMode = () => {
      if (desktopQuery.matches) {
        setViewportMode(ViewportMode.DESKTOP);
      } else if (mobileLandscapeQuery.matches) {
        setViewportMode(ViewportMode.MOBILE_LANDSCAPE);
      } else if (mobilePortraitQuery.matches) {
        setViewportMode(ViewportMode.MOBILE_PORTRAIT);
      }
    };

    updateViewportMode();

    desktopQuery.addEventListener("change", updateViewportMode);
    mobileLandscapeQuery.addEventListener("change", updateViewportMode);
    mobilePortraitQuery.addEventListener("change", updateViewportMode);

    return () => {
      desktopQuery.removeEventListener("change", updateViewportMode);
      mobileLandscapeQuery.removeEventListener("change", updateViewportMode);
      mobilePortraitQuery.removeEventListener("change", updateViewportMode);
    };
  }, []);

  const isDesktop = viewportMode === ViewportMode.DESKTOP;
  const isMobileLandscape = viewportMode === ViewportMode.MOBILE_LANDSCAPE;
  const isMobilePortrait = viewportMode === ViewportMode.MOBILE_PORTRAIT;

  return (
    <MediaQueryContext.Provider
      value={{
        viewportMode,
        isDesktop,
        isMobileLandscape,
        isMobilePortrait,
      }}
    >
      {children}
    </MediaQueryContext.Provider>
  );
};
