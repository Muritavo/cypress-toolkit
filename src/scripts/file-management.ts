import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

export function setupFileManagementTasks(on: Cypress.PluginEvents) {
  on("task", {
    readFileMaybe(config: {
      filepath: string;
      encoding: string;
    }) {
      const {
        encoding = "base64",
        filepath,
      } = config
      if (existsSync(filepath)) {
        return readFileSync(filepath, { encoding: encoding as any });
      }

      return null;
    },
  } as unknown as Cypress.Tasks);
}
