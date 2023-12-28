import { execTask } from "./augmentation/cypress";

Cypress.Commands.add(
  "readOptionalFile",
  (filepath: string, encoding?: BufferEncoding) => {
    return execTask("readFileMaybe", { filepath, encoding }, {log: false})
      .then((fileContent) => {
        return fileContent;
      });
  }
);
