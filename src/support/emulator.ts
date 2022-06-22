/**
 * These are a series of functions to control an emulator from the cypress tests
 */

function _killEmulatorPorts() {
    for (let port of [4000, 4400, 8055, 8080]) {
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
    });
    sessionStorage.setItem("last-database", databaseToImport)
})

Cypress.Commands.add("killEmulator", () => {
    _killEmulatorPorts();
    sessionStorage.removeItem("last-database")
})