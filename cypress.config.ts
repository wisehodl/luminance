import { defineConfig } from "cypress";
import vitePreprocessor from "cypress-vite";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("file:preprocessor", vitePreprocessor());
    },
    baseUrl: "http://localhost:5173",
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: {
        server: {
          port: 5174,
        },
      },
    },
  },
});
