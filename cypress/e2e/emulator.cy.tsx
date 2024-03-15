import { LOCALHOST_DOMAIN } from "../../src/consts";

describe("Prestarted emulator", () => {
  beforeEach(() => {
    cy.startEmulator("some-project");
  });

  it("Should be able to start a session", () => {
    cy.session("Some session test example", () => {
      cy.clearAuth("some-project");
      cy.addUser(
        "muritavo@outlook.com",
        "somepass",
        "some-project",
        "predictable-id"
      );
      cy.visit(`http://${LOCALHOST_DOMAIN}:3500`);
      cy.contains("login").click();
      cy.window().then((w) => {
        cy.waitUntil(() =>
          w.document.body.textContent!.includes("muritavo@outlook.com")
        );
      });
      cy.wait(5000);
    });
    cy.visit(`http://${LOCALHOST_DOMAIN}:3500`);
    cy.contains("muritavo@outlook.com");
  });
});

describe("Starting emulator", () => {
  afterEach(() => {
    cy.pause();
    cy.killEmulator();
  });
  it.only("Should be able to connect to emulator", () => {
    cy.startEmulator("some-project", undefined, undefined, undefined, [
      "auth",
      "firestore",
      "storage",
    ]).then(() => {
      return new Cypress.Promise(async (r) => {
        const res2 = await fetch("http://localhost:9099");
        cy.log(`Response from AUTH: ${res2.status}`);
        const res = await fetch("http://localhost:8080");
        cy.log(`Response from FIRESTORE: ${res.status}`);
        r();
      });
    });
  });
});
