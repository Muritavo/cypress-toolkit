import { execTask } from "./augmentation/cypress.js";

Cypress.Commands.add(
  "readOptionalFile",
  (filepath: string, encoding?: BufferEncoding) => {
    return execTask("readFileMaybe", { filepath, encoding }, {log: false})
      .then((fileContent) => {
        return fileContent;
      });
  }
);
