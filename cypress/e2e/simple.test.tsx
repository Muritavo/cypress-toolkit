it("Should intelisense correctly", () => {
    cy.startEmulator("fake_project");
    cy.killEmulator();
})