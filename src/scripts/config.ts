import setupVisualTesting from "./augmentation/visual-testing";
import { setupBlockchainTasks } from "./blockchain";
import setupEmulatorTasks from "./emulator";
import setupUtility from "./utility";
import { setupFileManagementTasks } from "./file-management";

export default function config(on: any, config: any) {
  require("@cypress/code-coverage/task")(on, config);
  setupVisualTesting(on, config);
  setupEmulatorTasks(on);
  setupBlockchainTasks(on);
  setupUtility(on);
  setupFileManagementTasks(on);
}
