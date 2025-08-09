import { StrictMode } from "react";

import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import { MediaQueryProvider, SelectedColorProvider } from "./providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MediaQueryProvider>
      <SelectedColorProvider>
        <App />
      </SelectedColorProvider>
    </MediaQueryProvider>
  </StrictMode>,
);
