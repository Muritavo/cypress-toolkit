/**
 * These are a series of functions to control an emulator from the cypress tests
 */

import {
  initializeTestEnvironment,
  RulesTestContext,
} from "@firebase/rules-unit-testing";
import nodeFetch from "node-fetch";
import { FirebaseConfigShape } from "./emulator.types";

let emulatorConfig: FirebaseConfigShape;
export function setEmulatorConfig(config: FirebaseConfigShape) {
  emulatorConfig = config;
}

export const killEmulator = () => {
  cy.execTask("killEmulator");
};

function _getPort(emulator: keyof FirebaseConfigShape["emulators"]) {
  if (!emulatorConfig) {
    throw new Error(`You didn't set the emulator config. Provide it by using the following at your cypress support file:

import { setEmulatorConfig } from '@muritavo/cypress-toolkit/dist/support/emulator'
...
...
...
before() {
    setEmulatorConfig(require("THE_PATH_TO_YOUR_FIREBASE_JSON"))
}
`);
  }
  const emulatorConfigSet = emulatorConfig.emulators[emulator];
  if (!emulatorConfigSet || !emulatorConfigSet.port) {
    throw new Error(`Emulator config not found`);
  }
  return emulatorConfigSet.port;
}

Cypress.Commands.add(
  "startEmulator",
  (projectName, databaseToImport = "", suiteId, exportDataOnExit = false) => {
    return cy
      .execTask("startEmulator", {
        projectId: projectName,
        databaseToImport: databaseToImport,
        UIPort: emulatorConfig.emulators.ui.port || 4000,
        suiteId: suiteId || databaseToImport,
        ports: Object.values(emulatorConfig.emulators).map((a) => a.port),
        shouldSaveData: exportDataOnExit,
      })
      .then(() => {
        sessionStorage.setItem("last-database", databaseToImport);
      });
  }
);

Cypress.Commands.add("killEmulator", () => {
  sessionStorage.removeItem("last-database");
});

Cypress.Commands.add("clearFirestore", (projectId: string) => {
  return new Cypress.Promise(async (r) => {
    const testEnv = await initializeTestEnvironment({
      projectId: projectId,
      firestore: {
        host: "localhost",
        port: _getPort("firestore"),
      },
    });
    await testEnv.clearFirestore();
    testEnv.cleanup();
    r();
  }) as any;
});

Cypress.Commands.add("clearAuth", (projectId: string) => {
  return new Cypress.Promise(async (r, rej) => {
    await nodeFetch(
      `http://localhost:${_getPort(
        "auth"
      )}/emulator/v1/projects/${projectId}/accounts`,
      {
        method: "delete",
      }
    )
      .then((res) => {
        if (res.status < 300) r();
        else rej(`Cleaning accounts returned ${res.status}`);
      })
      .catch(rej);
  }) as any;
});

Cypress.Commands.add(
  "addUser",
  (email: string, password, projectId, localId) => {
    return new Cypress.Promise<void>(async (r, rej) => {
      nodeFetch(
        `http://localhost:${_getPort(
          "auth"
        )}/identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`,
        {
          body: JSON.stringify({
            email,
            password,
            localId,
          }),
          headers: {
            "content-type": "application/json",
            authorization: "Bearer owner",
          },
          method: "post",
        }
      )
        .then((res) => {
          if (res.status < 300) r();
          else rej(`Creating account returned ${res.status}`);
        })
        .catch((e) => {
          rej(e);
        });
    }) as any;
  }
);

Cypress.Commands.add(
  "clearEmulatorStorage",
  (projectId, storageBucket, folder) => {
    cy.setupEmulator(
      async (_f, s) => {
        async function removeFiles(path: string) {
          const files = await s.ref(path).listAll();
          for (let preffix of files.prefixes)
            await removeFiles([path, preffix.name].join("/"));
          for (let file of files.items) await file.delete();
        }
        await removeFiles(folder);
      },
      projectId,
      storageBucket
    );
  }
);

Cypress.Commands.add(
  "setupEmulator",
  (cb: Parameters<typeof cy["setupEmulator"]>[0], projectId, storageBucket) => {
    return new Cypress.Promise<void>(async (r) => {
      const testEnv = await initializeTestEnvironment({
        projectId: projectId,
        firestore: {
          host: "localhost",
          port: _getPort("firestore"),
        },
        storage: {
          host: "localhost",
          port: _getPort("storage"),
        },
      });
      await testEnv.withSecurityRulesDisabled(async (ctx: RulesTestContext) => {
        await cb(
          ctx.firestore({
            experimentalForceLongPolling: true,
          }),
          ctx.storage(storageBucket),
          new Proxy(
            {},
            {
              get: (_, authInterfaceFunctionName) => {
                return (...params: any[]) => {
                  for (let param of params)
                    if (typeof param === "function")
                      throw new Error(
                        `The admin is called via proxy to the native node cypress process. A function cannot be passed as parameter to the function ${
                          authInterfaceFunctionName as string
                        }`
                      );
                  return cy.execTask("invokeAuthAdmin", {
                    projectId,
                    port: _getPort("auth").toString(),
                    functionName:
                      authInterfaceFunctionName as EmulatorOperations.AdminAuthInterfaceFunctions,
                    params: params as any,
                  });
                };
              },
            }
          ) as any
        );
      });
      r();
    }) as any;
  }
);

Cypress.Commands.add("deleteCollection", (path, project) => {
  return new Cypress.Promise<any>(async (r, rej) => {
    nodeFetch(
      `http://localhost:${_getPort(
        "firestore"
      )}/emulator/v1/projects/${project}/databases/(default)/documents${path}`,
      {
        method: "delete",
      }
    )
      .then(r)
      .catch(rej);
  }) as any;
});
