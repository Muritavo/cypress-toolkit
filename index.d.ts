/// <reference types="cypress-real-events"/>
/// <reference types="cypress-wait-until"/>
/// <reference types="cypress-file-upload"/>

type mountFunc = typeof import("cypress/react")['mountHook']
type FunctionComponent = typeof import("react")['FunctionComponent']

type OverloadProps<TOverload> = Pick<TOverload, keyof TOverload>;

type OverloadUnionRecursive<TOverload, TPartialOverload = unknown> = TOverload extends (
    ...args: infer TArgs
) => infer TReturn
    ? // Prevent infinite recursion by stopping recursion when TPartialOverload
    // has accumulated all of the TOverload signatures.
    TPartialOverload extends TOverload
    ? never
    :
    | OverloadUnionRecursive<
        TPartialOverload & TOverload,
        TPartialOverload & ((...args: TArgs) => TReturn) & OverloadProps<TOverload>
    >
    | ((...args: TArgs) => TReturn)
    : never;

// Inferring a union of parameter tuples or return types is now possible.
type OverloadParameters<T extends (...args: any[]) => any> = Parameters<OverloadUnionRecursive<T>>;

interface FuncInt {
    (arg: string, args: number): void
    (arg: number, args: symbol): void
}

declare type MountHookResult<T> = {
    readonly current: T | null | undefined;
    readonly error: Error | null;
};

type ExtractFromUnionKeys = "then" | "wait";

type RerenderChain<I, T> = {
    [k in Exclude<keyof Cypress.Chainable<I, T>, ExtractFromUnionKeys>]:
    Cypress.Chainable<I, T>[k] extends (...args: infer A) => infer R
    ? (...args: A) => RerenderChain<I, T>
    : never
} & {
        [k in ExtractFromUnionKeys]: (...args: OverloadParameters<Cypress.Chainable<I, T>[k]>) => RerenderChain<I, T>
    }

declare namespace Cypress {
    interface Chainable<Subject = any, RerenderFunc = any> {
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

        /**
         * This function was created to reduce boilerplate for rerendering.
         * 
         * This way, you can chain multiple rerenders and test multiple component states
         */
        mountChain<T extends FunctionComponent>(renderFunc: T): RerenderChain<Subject, T>
        /**
         * This function should be called after calling cy.mountChain
         * 
         * With this you can call the render function again, with new arguments
         */
        remount: (...props: Parameters<RerenderFunc>) => RerenderChain<Subject, RerenderFunc>
    }
    interface CustomTasks {
        startEmulator: (args: TasksArgs['StartEmulatorTask']) => Promise<null>,
        killEmulator: () => Promise<null>
    }
    interface Tasks extends CustomTasks { }
}

type TasksArgs = import("./src/scripts/tasks").TasksArgs;