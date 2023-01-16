import React from "react";

beforeEach(() => {
  cy.startEmulator("some-project");
});

it("Should be able to start a session", () => {
  cy.session("Some session test example 1111117", () => {
    cy.clearAuth("some-project");
    cy.addUser(
      "muritavo@outlook.com",
      "somepass",
      "some-project",
      "predictable-id"
    );
    cy.visit("http://localhost:3500");
    cy.contains("login").click();
    cy.window().then((w) => {
      cy.waitUntil(() =>
        w.document.body.textContent!.includes("muritavo@outlook.com")
      );
    });
    cy.wait(5000);
  });
  cy.visit("http://localhost:3500");
  cy.contains("muritavo@outlook.com");
});
