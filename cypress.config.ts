import { defineConfig } from "cypress";
import configSetup from "./src/scripts/config";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
    specPattern: "cypress/**/*.test.tsx",
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here

      on("task", {
        killWithCrash: async () => {
          const { default: kill } = await import("kill-port");
          await kill(15000).catch(() => {});
        },
      });

      return configSetup(on, config);
    },
  },
});
