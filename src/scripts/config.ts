import setupVisualTesting from "./augmentation/visual-testing";
import { setupBlockchainTasks } from "./blockchain";
import setupEmulatorTasks from "./emulator";

export default function config(on: any, config: any) {
    require('@cypress/code-coverage/task')(on, config)
    setupVisualTesting(on, config);
    setupEmulatorTasks(on);
    setupBlockchainTasks(on)
}