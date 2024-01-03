import { mount } from "cypress/react";
import React, {
  Fragment,
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import { createRoot } from "react-dom/client";

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

declare global {
  interface Window {
    documentPictureInPicture: {
      requestWindow: (config?: {
        height: number;
        width: number;
      }) => Promise<any>;
    };
    pipWindow?: Window;
  }
}

Cypress.Commands.add("mountPip", function renderPip(renderFunc) {
  const cypressWindow = window.parent!.window;
  function PipWrapper({
    children,
    viewport,
  }: PropsWithChildren<{ viewport: VisualViewport }>) {
    const [showContent, setShowContent] = useState(false);

    return (
      <>
        <span
          data-testid="cy-pip-open"
          style={{
            position: "fixed",
            height: 1,
            width: 1,
            opacity: 0,
            bottom: 0,
            right: 0,
            zIndex: 100000000000,
          }}
          onClick={async () => {
            if (!cypressWindow.pipWindow) {
              cypressWindow.pipWindow =
                await cypressWindow.documentPictureInPicture.requestWindow();
            }
            const renderRoot = createRoot(
              cypressWindow.pipWindow!.document.body
            );
            cypressWindow.pipWindow!.addEventListener("pagehide", () => {
              renderRoot.unmount();
              cypressWindow.pipWindow = undefined;
              setShowContent(true);
            });
            function resizeWindow() {
              const w = cypressWindow.pipWindow!;
              const targetViewport = w.visualViewport!;
              const viewportRatio = viewport.width / viewport.height;
              const targetViewportRatio =
                targetViewport.width / targetViewport.height;
              function calculateRatioFromWidth() {
                return targetViewport.width / viewport.width;
              }
              function calculateRatioFromHeight() {
                return targetViewport.height / viewport.height;
              }
              const ratio =
                viewport.width > viewport.height
                  ? targetViewportRatio < viewportRatio
                    ? calculateRatioFromWidth()
                    : calculateRatioFromHeight()
                  : targetViewportRatio > viewportRatio
                  ? calculateRatioFromHeight()
                  : calculateRatioFromWidth();
              const root = cypressWindow.pipWindow!.document.documentElement;
              const rootStyle = root.style;
              rootStyle.transformOrigin = "0px 0px";
              rootStyle.transform = `scale(${ratio})`;
            }
            cypressWindow.pipWindow!.addEventListener("resize", () => {
              resizeWindow();
            });
            renderRoot.render(children);
          }}
        >
          x
        </span>

        {showContent ? children : <h1>Showing on PIP</h1>}
      </>
    );
  }
  const chain = cy
    .mountChain((...args: any[]) => {
      return (
        <PipWrapper viewport={window.visualViewport!}>
          {renderFunc(...args)}
        </PipWrapper>
      );
    })
    .then(() => {
      const originalRerender = currRenderFunc;
      currRenderFunc = (...args: any[]) => {
        originalRerender(...args);
        cy.byTestId("cy-pip-open")
          .realClick()
          .then(() => {
            currRenderFunc = originalRerender;
          });
      };
    });

  return chain;
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
