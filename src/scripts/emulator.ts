import nodeFetch from "node-fetch";
import { spawn, ChildProcess } from "child_process";
import { TasksArgs } from "./tasks";

const log = require("debug")("cypress-toolkit/emulator");
let spawnResult: {
    project: string,
    database?: string,
    process: ChildProcess,
    id: string
};
function WaitTimeout(ml = 200) {
    return new Promise<void>((r) => {
        setTimeout(() => {
            r();
        }, ml);
    });
}
async function killEmulator() {
    if (!spawnResult)
        return Promise.resolve(null);
    return new Promise((r, rej) => {
        try {
            const t = setTimeout(() => {
                spawnResult = undefined as any;
                rej(new Error("Couldn't kill emulator"))
            }, 10000)
            spawnResult.process.on("close", () => {
                clearTimeout(t);
                r(null);
            })
            spawnResult.process.kill("SIGINT");
        } catch (e) {
            console.log("Unhandled exception", e);
            r(null)
        }
    })
}
async function startEmulatorTask(args: TasksArgs['StartEmulatorTask']) {
    log("Spawning emulator process")
    if (args.suiteId === spawnResult?.id)
        return null;
    else
        await killEmulator();
    spawnResult = {
        id: args.suiteId,
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
        }, 30000);

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
    } as Cypress.Tasks)
}