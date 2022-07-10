import * as path from 'path';
import { existsSync } from "fs";
import cypressVisualPlugin from "cypress-visual-regression/dist/plugin";

export default function setupVisualTesting(on: any, config: any) {
    cypressVisualPlugin(on, config);
    on('task', {
        snapshotExists: async ({ fileName, baseDir, specDirectory }: { fileName: string, baseDir?: string, specDirectory: string }) => {
            const snapshotBaseDirectory =
                baseDir || path.join(process.cwd(), 'cypress', 'snapshots', 'base');
            const expectedImage = path.join(
                snapshotBaseDirectory,
                specDirectory,
                `${fileName}-base.png`
            )

            return existsSync(expectedImage)
        }
    })
}