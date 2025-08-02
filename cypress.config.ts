import { defineConfig } from "cypress";
import vitePreprocessor from "cypress-vite";
import { mergeConfig } from "vite";

import viteConfig from "./vite.config";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, _) {
      on("file:preprocessor", vitePreprocessor());
    },
    baseUrl: "http://localhost:5173",
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: () => {
        return mergeConfig(viteConfig, {
          server: {
            port: 5174,
          },
        });
      },
    },
  },
});
