/// <reference types="cypress-real-events"/>
/// <reference types="cypress-wait-until"/>
/// <reference types="cypress-file-upload"/>

type mountFunc = typeof import("cypress/react")['mountHook']

declare type MountHookResult<T> = {
    readonly current: T | null | undefined;
    readonly error: Error | null;
};

declare namespace Cypress {
    interface Chainable<Subject = any> {
        /**
         * This function tries to start an emulator
         * 
         * It also keeps the emulator running until it changes @param databaseToImport. 
         * @param projectName A required project name for the emulator to start with
         * @param forceStart Force startup
         * @param databaseToImport a (preferably absolute) path to the emulator backup
         * 
         * If you require the emulator to be recreated after the tests use the function cy.killEmulator() on a afterEach block
         */
        startEmulator(projectName: string, databaseToImport?: string, forceStart?: boolean): Chainable<void>

        /**
         * This function force kills all emulator related ports
         */
        killEmulator(): Chainable<void>

        /**
         * Adds a new user to the emulator
         */
        addUser(email: string, password: string, projectName: string): Chainable<{}>

        /**
         * Clear the current firestore database
         */
        clearFirestore(projectName: string): Chainable<void>

        /**
         * Clear the current firestore database
         */
        clearAuth(projectName: string): Chainable<void>

        /**
         * Gives access to the admin interface for managing and setting up the emulator environment
         */
        setupEmulator(setupFunc: (firestore: import("@firebase/rules-unit-testing").RulesTestContext['firestore']) => Promise<void>, project: string): Chainable<void>

        /**
         * This finds an element based on their testids
         */
        byTestId(testId: string): Chainable<JQuery<HTMLElement>>

        /**
         * Generates a random image from a string
         * 
         * chains to a base64 string of the image
         */
        randomImage(width: number, height: number, seed: string): Chainable<string>

        /**
         * Mount hook with a wrapper
         */
        mountHookWrap: <T>(hookFn: (...args: any[]) => T, Wrapper: React.FunctionComponent) => Cypress.Chainable<MountHookResult<T>>;

        /**
         * Generate a delayed function for usage with cypress
         */
        delayedSpy: (shouldSucceed: boolean, timeout: number, resolveOrRejectWith: any) => Cypress.Agent

        /**
         * If a previous image exists, compare with it. If not set the current image as previous image
         */
        comparePreviousUI: (snapshotId) => Cypress.Chainable<void>

        /**
         * A copy of cy.task to allow intelissense support
         */
        execTask<E extends keyof Cypress.CustomTasks = keyof Cypress.CustomTasks>(event: E, arg?: Parameters<Cypress.CustomTasks[E]>[0], options?: Partial<Loggable & Timeoutable>): Chainable<Awaited<ReturnType<Cypress.CustomTasks[E]>>>
    }
    interface CustomTasks {
        startEmulator: (args: TasksArgs['StartEmulatorTask']) => Promise<null>,
        killEmulator: () => Promise<null>
    }
    interface Tasks extends CustomTasks { }
}

type TasksArgs = import("./src/scripts/tasks").TasksArgs;