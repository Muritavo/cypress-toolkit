/// <reference path="../../../node_modules/@muritavo/mcp-tools/dist/cypress/types/index.d.ts"/>

try {
  require("@muritavo/mcp-tools/dist/cypress/support/commands-augmentation");
} catch (error) {}

export function addCommand<
  T extends keyof Cypress.Chainable,
  O extends Cypress.CommandOptions,
>(
  name: T,
  usage: string,
  options: O,
  handler: O extends { prevSubject: true }
    ? Cypress.CommandFnWithSubject<T, any>
    : Cypress.CommandFn<T>,
): void;
export function addCommand<T extends keyof Cypress.Chainable>(
  name: T,
  usage: string,
  handler: Cypress.CommandFn<T>,
): void;
export function addCommand<T extends keyof Cypress.Chainable>(
  name: T,
  usage: string,
  handlerOrOptions:
    | Cypress.CommandFn<T>
    | (Cypress.CommandOptions & { prevSubject: false }),
  maybeHandler?: Cypress.CommandFn<T>,
) {
  const hasOptions = typeof handlerOrOptions === "object";
  const options = hasOptions ? handlerOrOptions : {};
  const handler =
    typeof handlerOrOptions === "object" ? maybeHandler : handlerOrOptions;
  if (!!Cypress.Commands.addAndDocument) {
    Cypress.Commands.addAndDocument(name, usage, handler, options);
  } else {
    if (!hasOptions) Cypress.Commands.add(name, handler!);
    else Cypress.Commands.add(name, options as any, handler!);
  }
}
