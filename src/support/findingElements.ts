Cypress.Commands.add('byTestId', (test) => {
    return cy.get(`[data-testid="${test}"]`)
})