/**
 * These are a series of functions to control an emulator from the cypress tests
 */

import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import nodeFetch from "node-fetch";
let emulatorPorts = [4000, 4400, 8055, 8080]
export function setEmulatorPorts(ports: number[]) {
    emulatorPorts = ports
}

function _killEmulatorPorts() {
    for (let port of emulatorPorts) {
        cy.exec(`yarn kill-port ${port}`)
    }
}

Cypress.Commands.add("startEmulator", (projectName, databaseToImport = "") => {
    if (sessionStorage.getItem("last-database") === databaseToImport)
        return;
    _killEmulatorPorts();
    const command = `yarn start-firebase-emulator ${projectName} ${databaseToImport}`;
    cy.exec(command, {
        // It takes time to up an emulator
        timeout: 60000,
    }).then(() => {
        sessionStorage.setItem("last-database", databaseToImport)
    });
})

Cypress.Commands.add("killEmulator", () => {
    _killEmulatorPorts();
    sessionStorage.removeItem("last-database")
})

Cypress.Commands.add("clearFirestore", (projectId: string, emulatorPorts) => {
    return new Cypress.Promise(async (r) => {
        const testEnv = await initializeTestEnvironment({
            projectId: projectId,
            firestore: {
                host: "localhost",
                port: emulatorPorts.firestore,
            },
        });
        await testEnv.clearFirestore();
        testEnv.cleanup()
        r()
    }) as any
})

Cypress.Commands.add("clearAuth", (projectId: string, ports) => {
    return new Cypress.Promise(async (r, rej) => {
        await nodeFetch(`http://localhost:${ports.auth}/emulator/v1/projects/${projectId}/accounts`, {
            method: "delete"
        }).then(res => {
            if (res.status < 300)
                r()
            else
                rej(`Cleaning accounts returned ${res.status}`)
        }).catch(rej)
    }) as any
})

Cypress.Commands.add("addUser", (email: string, password, projectId, ports) => {
    return new Cypress.Promise<void>(async (r, rej) => {
        nodeFetch(`http://localhost:${ports.auth}/identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`, {
            body: JSON.stringify({
                email,
                password,
            }),
            headers: {
                "content-type": "application/json",
                "authorization": "Bearer owner"
            },
            method: "post"
        }).then((res) => {
            if (res.status < 300)
                r()
            else
                rej(`Creating account returned ${res.status}`)
        }).catch(e => {
            rej(e)
        })
    }) as any
})

Cypress.Commands.add("setupEmulator", (cb: (fs: any) => Promise<void>, projectId, ports) => {
    return new Cypress.Promise<void>(async r => {
        const testEnv = await initializeTestEnvironment({
            projectId: projectId,
            firestore: {
                host: "localhost",
                port: ports.firestore,
            },
        });
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
            await cb(ctx.firestore({
                experimentalForceLongPolling: true
            }))
        });
        r()
    }) as any
})