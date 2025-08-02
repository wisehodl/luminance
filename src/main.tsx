import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import { MediaQueryProvider } from "./providers";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MediaQueryProvider>
      <App />
    </MediaQueryProvider>
  </StrictMode>,
);
