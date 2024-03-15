import { defineConfig } from "cypress";
import configSetup from "./src/scripts/config";
import { spawn } from "child_process";
import { resolve } from "path";

spawn("yarn", ["start"], {
  env: {
    ...process.env,
  },
  stdio: "inherit",
  cwd: resolve("example-app"),
})
  .on("exit", (c) => console.log(`Exited with code ${c}`))
  .on("close", (c) => console.log(`Closed with code ${c}`))
  .on("message", (message) => console.log(message.toString()))
  .on("error", (e) => console.log(e));

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
