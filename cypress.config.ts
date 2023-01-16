import { defineConfig } from "cypress";
import configSetup from "./dist/scripts/config";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
    specPattern: "cypress/e2e/**/*.test.tsx",
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return configSetup(on, config);
    },
  },
});
