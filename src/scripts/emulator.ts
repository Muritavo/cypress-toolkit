import nodeFetch from "node-fetch";
import { spawn, ChildProcess } from "child_process";
import { TasksArgs } from "./tasks";

const log = require("debug")("@muritavo:cypress:starter");
let spawnResult: {
    project: string,
    database?: string,
    process: ChildProcess
};
function WaitTimeout(ml = 200) {
    return new Promise<void>((r) => {
        setTimeout(() => {
            r();
        }, ml);
    });
}
async function killEmulator() {
    if (spawnResult)
        spawnResult.process.kill("SIGINT");
    return Promise.resolve(null);
}
async function startEmulatorTask(args: TasksArgs['StartEmulatorTask']) {
    log("Spawning emulator process")
    spawnResult = {
        project: args.projectId,
        database: args.databaseToImport,
        process: spawn(
            `firebase emulators:start -P ${args.projectId} ${args.databaseToImport ? `--import ${args.databaseToImport}` : ""}`,
            {
                cwd: undefined,
                env: process.env,
                shell: true,
            }
        )
    }

    /**
     * This script exists so we can start an emulator from inside cypress
     */
    return new Promise<null>(async (r, rej) => {
        let breakLoop = false;
        const timeout = setTimeout(() => {
            breakLoop = true;
            console.error("Could not receive ok from firebase emulator");
            clearTimeout(timeout);
            rej(new Error("Timeout"))
        }, 60000);

        log("Process is killed: ", spawnResult.process.killed)
        log("Process exit code", spawnResult.process.exitCode)

        spawnResult.process.on("error", (e) => {
            clearTimeout(timeout);
            log("Spawning emulator process failed with error", e.message);
            rej(new Error(`Spawning emulator process failed with error ${e.message}`))
        })

        spawnResult.process.on("message", (e) => {
            log("Emulator start sent message", e.toString());
        })

        spawnResult.process.on("close", (e) => {
            clearTimeout(timeout);
            log("Emulator closed with", e);
            rej(new Error(`Emulator closed with code ${e}. Check the firebse-debug.log for more details`));
        })
        while (!breakLoop) {
            try {
                log("Checking if emulator is up")
                await nodeFetch(`http://localhost:${args.UIPort}`);
                log("Emulator is up and ready")
                clearTimeout(timeout);
                breakLoop = true;
                r(null);
            } catch (e) {
                log("Process is killed: ", spawnResult.process.killed)
                log("Emulator is not ready yet, retrying in 1 sec")
            }
            await WaitTimeout(1000);
        }
    })

}

export default function setupEmulatorTasks(on: Cypress.PluginEvents) {
    on('task', {
        startEmulator: startEmulatorTask,
        killEmulator
    })
}