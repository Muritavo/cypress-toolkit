import setupVisualTesting from "./augmentation/visual-testing";
import { setupBlockchainTasks } from "./blockchain";
import setupEmulatorTasks from "./emulator";
import setupUtility from "./utility";
import { setupFileManagementTasks } from "./file-management";
import { createRequire } from "module";

export default function config(on: any, config: any) {
  createRequire(import.meta.url)("@cypress/code-coverage/task")(on, config);
  setupVisualTesting(on, config);
  setupEmulatorTasks(on);
  setupBlockchainTasks(on);
  setupUtility(on);
  setupFileManagementTasks(on);
}
