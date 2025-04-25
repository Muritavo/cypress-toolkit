import { TasksArgs } from "./tasks";
import {
  invokeAuthAdmin,
  killEmulator,
  registerEmulator,
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
    registerEmulator: (args) => registerEmulator(args).then(() => null),
  } as Cypress.Tasks);
}
