Cypress.Commands.add("dragElement", { prevSubject: true }, (el, x, y) => {
  cy.wrap(el)
    .trigger("mousedown")
    .wait(100)
    .trigger("mousemove", {
      offsetX: x,
      offsetY: y,
    })
    .wait(100)
    .realMouseUp();
});
