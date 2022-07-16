import { provider } from "ganache";

Cypress.Commands.add("startBlockchain", (projectRootFolder) => {
    return cy.execTask("startBlockchain", projectRootFolder).then(() => { (window as any).ethereum = "http://localhost:15000" });
})

Cypress.Commands.add("deployContract", (contractName, ...args) => {
    return cy.execTask("deployContract", { contractName, args })
})
