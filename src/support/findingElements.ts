Cypress.Commands.add("byTestId", (test, options) => {
  return cy.get(`[data-testid="${test}"]`, options);
});
