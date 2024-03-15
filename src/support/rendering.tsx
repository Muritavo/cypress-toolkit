import { mount } from "cypress/react18";
import React, {
  Fragment,
  PropsWithChildren,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useState,
} from "react";
import { Root, createRoot } from "react-dom/client";

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
    currRenderFunc = (...props: Parameters<typeof renderFunc>) => {
      return r.rerender(renderFunc(...props));
    };
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

/**
 * This uses an internal cypress function to change the document where the commands make their queries
 */
function _changeDocumentToQuery(document: Document) {
  const anyCy = cy as any;
  anyCy.state("document", document);
}

Cypress.Commands.add("mountPip", function renderPip(renderFunc) {
  const cypressWindow = window.parent!.window;
  function PipWrapper({
    children,
    viewport,
  }: PropsWithChildren<{ viewport: VisualViewport }>) {
    const [showContent, setShowContent] = useState(false);
    const [pipRenderRoot, setPipRenderRoot] = useState<Root>();

    useLayoutEffect(() => {
      if (pipRenderRoot) pipRenderRoot.render(children);
    });

    const pip = cypressWindow.pipWindow;
    useEffect(() => {
      if (pip) {
        function cloneStyles() {
          cypressWindow
            .pipWindow!.document.head.querySelectorAll("style")
            .forEach((node) => {
              if (!node.getAttribute("data-toolkit-pip")) node.remove();
            });
          const preinjectedStyles = document.head.querySelectorAll("style");
          for (let node of Array.from(preinjectedStyles))
            cypressWindow.pipWindow!.document.head.appendChild(
              node.cloneNode(true)
            );
        }
        const observer = new MutationObserver(() => {
          cloneStyles();
        });
        observer.observe(window.document.head, { childList: true });
        cloneStyles();
      }
    }, [pip]);

    function resizeWindow() {
      const pip = cypressWindow.pipWindow!;
      const pipViewport = pip.visualViewport!;
      // pip.alert(`${pipViewport.width} ${pipViewport.height}`);
      /** This is the ratio of the pip viewport | 1 = square | < 1 = portrait (more compressed) | > 1 = landscape (more stretched) */
      const pipRatio = pipViewport.width / pipViewport.height;
      const cypressRatio = viewport.width / viewport.height;

      // pip.alert(`${ratios.map((r) => Ratio[r])}`);
      function calculateRatioFromWidth() {
        return pipViewport.width / viewport.width;
      }
      function calculateRatioFromHeight() {
        return pipViewport.height / viewport.height;
      }
      const scaleDownBy =
        pipRatio < cypressRatio
          ? calculateRatioFromWidth()
          : calculateRatioFromHeight();

      const root = cypressWindow.pipWindow!.document.documentElement;
      const rootStyle = root.style;
      rootStyle.setProperty("transform", `scale(${scaleDownBy})`);
      rootStyle.setProperty("transform-origin", `0px 0px`);
      rootStyle.setProperty("height", `${root.clientHeight * scaleDownBy}px`);
    }

    useEffect(() => {
      if (showContent) {
        resizeWindow();
      }
    }, [viewport.width, viewport.height]);

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
              init();
            }
            const renderRoot = createRoot(
              cypressWindow.pipWindow!.document.body
            );

            cypressWindow.pipWindow!.addEventListener("pagehide", () => {
              renderRoot.unmount();
              cypressWindow.pipWindow = undefined;
              setShowContent(true);
              setPipRenderRoot(undefined);
              _changeDocumentToQuery(window.document);
            });

            function init() {
              const bodyStyle = cypressWindow.pipWindow!.document.body.style;
              const root = cypressWindow.pipWindow!.document.documentElement;
              const rootStyle = root.style;

              rootStyle.setProperty("background-size", "20px 20px");
              rootStyle.setProperty(
                "background-position",
                "0 0, 0 10px, 10px -10px, -10px 0px"
              );
              rootStyle.setProperty(
                "background-image",
                "linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)"
              );

              bodyStyle.height = `${viewport.height}px`;
              bodyStyle.width = `${viewport.width}px`;
              bodyStyle.position = "relative";
              bodyStyle.boxShadow = "0px 0px 12px -2px black";

              const s =
                cypressWindow.pipWindow!.document.createElement("style");
              s.setAttribute("data-toolkit-pip", "true");
              s.innerHTML = `body {background-color: white;}`;
              cypressWindow.pipWindow!.document.head.appendChild(s);
            }

            resizeWindow();
            cypressWindow.pipWindow!.addEventListener("resize", () => {
              resizeWindow();
            });
            _changeDocumentToQuery(cypressWindow.pipWindow!.document);
            setPipRenderRoot(renderRoot);
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
