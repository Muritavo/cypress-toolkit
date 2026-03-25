import { addCommand } from "./_shared/register";

addCommand(
  "byTestId",
  "Get an element by its data-testid attribute. Takes the testId",
  { prevSubject: false },
  (test, options) => {
    return cy.get(`[data-testid="${test}"]`, options);
  }
);