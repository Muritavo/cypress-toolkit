import register from "cypress-visual-regression/dist/command"
import { join } from "path"
register()

const cypressWindow = window.parent.window;

declare global {
    interface Window {
        __cypress_toolkit_snapshotsToUpdate__: string[];
    }
}

const snapshotsToUpdate = cypressWindow.__cypress_toolkit_snapshotsToUpdate__ = [] as string[];

function cleanUpSnapshotErrors() {
    snapshotsToUpdate.splice(0, snapshotsToUpdate.length - 1);
}

function handleVisualRegressionError(error: Error) {
    const imageName = /"([^"]+)"/.exec(error.message)![1];
    error.message = `The snapshot for this test doesn't match the one save on the fs.
To accept this UI change, press 'U' to update the snapshot.

${error.message}`
    snapshotsToUpdate.push(imageName)
}

/**
 * This takes the current snapshot, and sets it as the base one
 */
function setCurrentSnapshotAsBase(snapname: string) {
    const toDir = Cypress.env('SNAPSHOT_BASE_DIRECTORY');
    const fromDir = Cypress.config().screenshotsFolder;
    const log = alert;

    /**
     * This is terrible, but it's only way I found for calling a task outside a tesk
     */
    (Cypress as any).Commands._commands.task.fn('moveSnapshot', {
        fromPath: join(fromDir as string, Cypress.spec.name, `${snapname}-actual.png`),
        toDir,
        specName: Cypress.spec.name,
        fileName: `${snapname}-base.png`,
    }).then(() => {
        log(`Updated snapshot ${snapname}`)
    });
}

/**
 * Bind a new ui command
 */
cypressWindow.addEventListener('keypress', ({ key }: KeyboardEvent) => {
    if (key === 'u') {
        snapshotsToUpdate.forEach(setCurrentSnapshotAsBase);
    }
})

/**
 * Bind hooks
 */
before(cleanUpSnapshotErrors);

beforeEach(() => {
    cy.on('fail', (e) => {
        if (e.message.includes("image is different"))
            handleVisualRegressionError(e)
        throw e
    })
})

Cypress.Commands.add('comparePreviousUI', (imageId: string) => {
    cy.window().then(_w => {
        const doc = _w.parent.document.body;
        const resolutionBoundId = `${imageId}-${doc.clientWidth}-${doc.clientHeight}`;
        cy.task<boolean>('snapshotExists', {
            specDirectory: Cypress.spec.name,
            baseDir: Cypress.env('SNAPSHOT_BASE_DIRECTORY'),
            diffDir: Cypress.env('SNAPSHOT_DIFF_DIRECTORY'),
            keepDiff: Cypress.env('ALWAYS_GENERATE_DIFF'),
            fileName: `${resolutionBoundId}`,
        }).then(exists => {
            alert('exists ' + exists)
            Cypress.env('type', (exists) ? 'actual' : 'base')
            cy.compareSnapshot(resolutionBoundId);
        })
    })

});