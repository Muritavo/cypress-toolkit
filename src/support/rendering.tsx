import { mount } from "cypress/react";
import React, { Fragment, ReactFragment } from "react";

function resultContainer() {
  var value: any = null;
  var error: any = null;
  var resolvers: any[] = [];
  var result = {
    get current() {
      if (error) {
        throw error;
      }
      return value;
    },
    get error() {
      return error;
    },
  };
  var updateResult: any = function (val: any, err: any) {
    if (err === void 0) {
      err = null;
    }
    value = val;
    error = err;
    resolvers.splice(0, resolvers.length).forEach(function (resolve) {
      return resolve();
    });
  };
  return {
    result: result,
    addResolver: function (resolver: any) {
      resolvers.push(resolver);
    },
    setValue: function (val: any) {
      return updateResult(val);
    },
    setError: function (err: any) {
      return updateResult(undefined, err);
    },
  };
}
function TestHook(_a: any) {
  var callback = _a.callback,
    onError = _a.onError,
    children = _a.children;
  try {
    children(callback());
  } catch (err: any) {
    if ("then" in err) {
      throw err;
    } else {
      onError(err);
    }
  }
  return null;
}
Cypress.Commands.add("mountHookWrap", function (hookFn, Wrapper) {
  var _a = resultContainer(),
    result = _a.result,
    setValue = _a.setValue,
    setError = _a.setError;
  var componentTest = React.createElement(
    Wrapper,
    undefined,
    React.createElement(TestHook, {
      callback: hookFn,
      onError: setError,
      children: setValue,
    })
  );
  return mount(componentTest).then(function () {
    return result;
  });
});

let currRenderFunc: any;
Cypress.Commands.add("mountChain", function renderChain(renderFunc) {
  mount(<Fragment />).then((r) => {
    currRenderFunc = (...props: Parameters<typeof renderFunc>) =>
      r.rerender(renderFunc(...props));
  });
});
Cypress.Commands.add("remount" as any, function (...props) {
  return currRenderFunc(...props);
});
Cypress.Commands.add(
  "inViewport",
  {
    prevSubject: true,
  },
  (selector: JQuery<HTMLElement>, mode = "dimension-wise") => {
    function checkElementInScreen(el: HTMLElement) {
      cy.window().then((window) => {
        const { documentElement } = window.document;
        const bottom = documentElement.clientHeight + 10;
        const right = documentElement.clientWidth + 10;
        const rect = el.getBoundingClientRect();

        const isWidthInbound =
          Number(rect.right.toFixed(0)) < right &&
          Number(rect.left.toFixed(0)) >= 0;

        const isHeightInBound =
          Number(rect.top.toFixed(0)) >= 0 &&
          Number(rect.bottom.toFixed(0)) < bottom;

        let isInsideView = true;
        switch (mode) {
          case "dimension-wise":
            isInsideView = isWidthInbound && isHeightInBound;
            break;
          case "height-wise":
            isInsideView = isHeightInBound;
            break;
          case "width-wise":
            isInsideView = isWidthInbound;
            break;
        }

        if (isInsideView) {
          expect("Element is inside screen").equal("Element is inside screen");
        } else {
          throw new Error(
            "Element is not fully on visible page, should you scroll before asserting?"
          );
        }
      });
    }
    const els = selector.get();
    if (els.length === 0)
      throw new Error(
        "No element to validate visibility, you sure the selector is right?"
      );
    for (let el of els) {
      checkElementInScreen(el);
    }
  }
);
