export const execTask: typeof cy.execTask = (...args) => {
  return cy.task(...args);
};

cy.execTask = execTask as any;
