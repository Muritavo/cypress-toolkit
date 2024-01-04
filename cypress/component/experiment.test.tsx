import React, { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

it.only("Should be able to change the document", () => {
  const chain = cy.mountPip((t: number) => (
    <>
      <h1>I'm in pip {t}</h1>
      <h3>This is the h3 I want to query</h3>
    </>
  ));
  chain.remount(1).wait(1000);

  cy.get("h3")
    .then((el) => (el.get(0).style.backgroundColor = "red"))
    .wait(1000);
  chain.remount(2);

  alert("Now close the pip window");
  cy.pause();

  chain.remount(3);
  cy.get("h3")
    .then((el) => (el.get(0).style.backgroundColor = "red"))
    .wait(1000);
});

describe("Understanding cypress internals", () => {
  it('How does it define the get root? Answer: It initially access the document that is set on an internal state on key "document"', () => {});
});

it("Does the same reference share html? Answer: NO", () => {
  function Wrapper() {
    const ref1 = useRef<HTMLDivElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const el = document.createElement("div");
      el.innerHTML = "<h2>This is a content</h2>";
      ref1.current?.appendChild(el);
      ref2.current?.appendChild(el);
    }, []);
    return (
      <>
        <h1>there are 2 divs</h1>
        <div
          ref={ref1}
          style={{ backgroundColor: "red", width: "100%", height: "100px" }}
        ></div>
        <div
          ref={ref2}
          style={{ backgroundColor: "green", width: "100%", height: "100px" }}
        ></div>
      </>
    );
  }
  cy.mount(
    <>
      <Wrapper />
    </>
  );
});
