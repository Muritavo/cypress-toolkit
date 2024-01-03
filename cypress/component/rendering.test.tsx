import React from "react";
import { useEffect } from "react";

it.each(
  [
    [
      [1000, 500],
      [700, 500],
    ],
    [
      [800, 2000],
      [800, 1500],
    ],
  ],
  "Should be able to render on pip real resolution",
  ([viewport, testDiv]) => {
    cy.viewport(viewport[0], viewport[1]);
    function Wrapper() {
      useEffect(() => {
        window.document.body.style.backgroundColor = "black";
      });
      return (
        <div
          style={{
            background: "linear-gradient(90deg, red,green,blue)",
            width: `${testDiv[0]}px`,
            height: `${testDiv[1]}px`,
          }}
        ></div>
      );
    }
    const chain = cy.mountPip(() => <Wrapper />);
    chain.remount();

    // After pausing, resize the pip window to check that the components are fully visible in all proportions
    cy.pause();
  }
);
