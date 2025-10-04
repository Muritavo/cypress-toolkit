import { join } from "path";

(async () => {
  try {
    require("cypress-visual-regression/dist/command").register();
  } catch (e) {
    try {
      await import("cypress-visual-regression/dist/command").then(
        ({ default: d }) => {
          d();
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
})();

const cypressWindow = window.parent.window;

declare global {
  interface Window {
    __cypress_toolkit_snapshotsToUpdate__: string[];
  }
}

/**
 * This takes the current snapshot, and sets it as the base one
 */
function setCurrentSnapshotAsBase(snapname: string) {
  const toDir = Cypress.env("SNAPSHOT_BASE_DIRECTORY");
  const fromDir = Cypress.config().screenshotsFolder;
  const log = cy.log;

  /**
   * This is terrible, but it's only way I found for calling a task outside a tesk
   */
  cy.task("moveSnapshot", {
    fromPath: join(
      fromDir as string,
      Cypress.spec.name,
      `${snapname}-actual.png`
    ),
    toDir,
    specName: Cypress.spec.name,
    fileName: `${snapname}-base.png`,
  }).then(() => {
    log(`Updated snapshot ${snapname}`);
  });
}

/**
 * Bind a new ui command
 */

beforeEach(() => {
  cy.on("fail", (e) => {
    if (e.message.includes("image is different")) {
      const imageName = /"([^"]+)"/.exec(e.message)![1];
      let shouldUpdate: boolean = false;
      const setShouldUpdate = ({ key }: KeyboardEvent) => {
        if (key === "u") {
          alert("The snapshot will be updated");
          shouldUpdate = true;
        }
      };
      cypressWindow.addEventListener("keypress", setShouldUpdate);
      e.message = `The snapshot for this test doesn't match the one saved on the fs.
To accept this UI change, press 'U' to update the snapshot.

${e.message}`;
      cy.log(e.message);
      cy.wait(5000).then(() => {
        cypressWindow.removeEventListener("keypress", setShouldUpdate);
        if (shouldUpdate) {
          setCurrentSnapshotAsBase(imageName);
        } else throw e;
      });
    }
    throw e;
  });
});

Cypress.Commands.add("comparePreviousUI", (imageId: string) => {
  cy.window().then((_w) => {
    const doc = _w.parent.document.body;
    const resolutionBoundId = `${imageId}-${doc.clientWidth}-${doc.clientHeight}`;
    cy.task<boolean>("snapshotExists", {
      specDirectory: Cypress.spec.name,
      baseDir: Cypress.env("SNAPSHOT_BASE_DIRECTORY"),
      diffDir: Cypress.env("SNAPSHOT_DIFF_DIRECTORY"),
      keepDiff: Cypress.env("ALWAYS_GENERATE_DIFF"),
      fileName: `${resolutionBoundId}`,
    }).then((exists) => {
      Cypress.env("type", exists ? "actual" : "base");
      cy.compareSnapshot(resolutionBoundId);
    });
  });
});

Cypress.Commands.add("assertHTML", (testId, mode) => {
  (testId ? cy.byTestId(testId) : cy.byTestId("root"))
    .then((el) => {
      const htmlEl = el.get(0) as HTMLDivElement;
      const htmlStr = htmlEl.innerHTML.replace(/radix-[^"]+/g, "");
      const newEl = new DOMParser().parseFromString(htmlStr, "text/html");
      newEl.querySelectorAll("[data-testid]").forEach((element) => {
        element.removeAttribute("data-testid");
      });
      return cy.wrap(mode !== "html" ? newEl.body.textContent : newEl.body, {
        log: false,
      });
    })
    .snapshot();
});
