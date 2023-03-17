it("Should not end cypress process when a port is killed incorrectly", () => {
    cy.task("killWithCrash")
})