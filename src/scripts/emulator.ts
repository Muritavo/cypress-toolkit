import { TasksArgs } from "./tasks";
import {
  invokeAuthAdmin,
  killEmulator,
  startEmulator,
} from "@muritavo/testing-toolkit/dist/native/emulator";

async function startEmulatorTask(
  args: TasksArgs["StartEmulatorTask"],
  retryIntent: boolean = false
) {
  return await startEmulator(args, retryIntent);
}

export default function setupEmulatorTasks(on: Cypress.PluginEvents) {
  on("task", {
    startEmulator: startEmulatorTask,
    killEmulator: killEmulator,
    invokeAuthAdmin: invokeAuthAdmin,
  } as Cypress.Tasks);
}
