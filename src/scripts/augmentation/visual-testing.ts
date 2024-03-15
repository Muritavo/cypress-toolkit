import * as path from "path";
import { existsSync } from "fs";
import chalk from "chalk";

async function loadVisualRegressionPlugin() {
  try {
    return require("cypress-visual-regression/dist/plugin");
  } catch (e) {
    try {
      return (await import("cypress-visual-regression/dist/plugin")).default;
    } catch (e) {
      console.log(
        chalk.red(
          `\n\n\ncypress-visual-regression is not installed. Visual regression will not be available\n\n\n`
        )
      );
    }
  }
}

export default async function setupVisualTesting(on: any, config: any) {
  const cypressVisualPlugin = await loadVisualRegressionPlugin();
  if (!cypressVisualPlugin) return;
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
}
