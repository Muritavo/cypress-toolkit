import { execTask } from "./augmentation/cypress";

Cypress.Commands.add(
  "expectRejection",
  (rejectionFunc: () => Promise<any>, expectedMessage) => {
    return new Cypress.Promise(async (res, rej) => {
      try {
        await rejectionFunc();
        rej("The provided function did not reject");
      } catch (e: any) {
        try {
          expect(e.toString()).to.include(expectedMessage);
          res();
        } catch (e) {
          rej(e);
        }
      }
    }) as any;
  }
);

Cypress.Commands.add("storeData", (k, v) => {
  return execTask(
    "storeData",
    {
      key: k,
      value: v,
    },
    {
      log: false,
    }
  ).then(() => v);
});

Cypress.Commands.add("getData", (k) => {
  execTask("getData", k, {
    log: false,
  });
});

Cypress.Commands.add("clearData", (k) => {
  execTask("clearData", k, {
    log: false,
  });
});

cy.delayedSpy = (shouldSucceed, timeout, resolveOrRejectWith) => {
  return cy.spy(() => {
    return new Promise<void>((r, rej) => {
      setTimeout(() => {
        const result =
          typeof resolveOrRejectWith === "function"
            ? resolveOrRejectWith()
            : resolveOrRejectWith;
        if (shouldSucceed) r(result);
        else rej(result);
      }, timeout);
    });
  });
};
