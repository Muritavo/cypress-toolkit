/// <reference types="cypress-real-events"/>
/// <reference types="cypress-wait-until"/>
/// <reference types="cypress-file-upload"/>
declare namespace Cypress {
    interface Chainable<Subject = any> {
        /**
         * This function tries to start an emulator
         * 
         * It also keeps the emulator running until it changes @param databaseToImport. 
         * @param projectName A required project name for the emulator to start with
         * @param databaseToImport a (preferably absolute) path to the emulator backup
         * 
         * If you require the emulator to be recreated after the tests use the function cy.killEmulator() on a afterEach block
         */
        startEmulator(projectName: string, databaseToImport?: string): Chainable<void>

        /**
         * This function force kills all emulator related ports
         */
        killEmulator(): Chainable<void>

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

        //   login(
        //     context: import('@firebase/rules-unit-testing').RulesTestEnvironment | TestEntities.FirebaseUser,
        //     user?: TestEntities.FirebaseUser
        //   ): Chainable<Subject>
        //   delay(
        //     ms: number,
        //     forAction: { action: Function; label: string }
        //   ): Chainable<Subject>
        //   containTranslation(
        //     t: TranslationCodesByTenant[keyof TranslationCodesByTenant],
        //     props?: any
        //   ): Chainable<JQuery<HTMLElement>>
        //   responsive<D extends RESOLUTION[] = PREDEF_DEVICES[keyof PREDEF_DEVICES]>(assertions: (device: D[number]) => void, res?: D): Chainable<Subject>
        //   inViewport(mode?: "dimension-wise" | "width-wise" | "height-wise"): Chainable<Subject>
        //   snapshot(): Chainable<Subject>
    }
}