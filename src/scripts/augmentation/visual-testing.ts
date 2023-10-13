import * as path from "path";
import { existsSync } from "fs";

export default function setupVisualTesting(on: any, config: any) {
  try {
    const cypressVisualPlugin = require("cypress-visual-regression/dist/plugin");
    cypressVisualPlugin(on, config);
    on("task", {
      snapshotExists: async ({
        fileName,
        baseDir,
        specDirectory,
      }: {
        fileName: string;
        baseDir?: string;
        specDirectory: string;
      }) => {
        const snapshotBaseDirectory =
          baseDir || path.join(process.cwd(), "cypress", "snapshots", "base");
        const expectedImage = path.join(
          snapshotBaseDirectory,
          specDirectory,
          `${fileName}-base.png`
        );

        return existsSync(expectedImage);
      },
    });
  } catch (e) {
    console.error(
      `cypress-visual-regression is not installed. Visual regression will not be available`
    );
  }
}
