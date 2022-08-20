import React from "react";
import { mount } from "@cypress/react";

it("Should be able to detect wrong languages", () => {
  mount(
    <>
      <h1>This should be valid</h1>
      <h1>This shouuld not</h1>
    </>
  );
  cy.validateSpelling("pt-BR");
});
