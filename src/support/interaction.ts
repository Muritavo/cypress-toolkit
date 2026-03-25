import { addCommand } from "./_shared/register";

addCommand(
  "dragElement",
  "Drag an element by x and y coordinates. Takes x and y to specify where to drag to",
  { prevSubject: true },
  (el, x, y) => {
    cy.wrap(el)
      .trigger("mousedown")
      .wait(100)
      .trigger("mousemove", {
        offsetX: x,
        offsetY: y,
      })
      .wait(100)
      .realMouseUp();
  }
);
