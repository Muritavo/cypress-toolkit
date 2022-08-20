import { defineConfig } from "cypress";
import setup from "./dist/scripts/config";
export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
    setupNodeEvents(on, config) {
      setup(on, config)
    },
    specPattern: "cypress/e2e/**/*.test.tsx"
  },
});
