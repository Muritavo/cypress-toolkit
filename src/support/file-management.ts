import { execTask } from "./augmentation/cypress";

const fs = require("fs");

Cypress.Commands.add(
  "readOptionalFile",
  (filepath: string, encoding?: BufferEncoding) => {
    return execTask("readFileMaybe", { filepath, encoding }, {log: false})
      .then((fileContent) => {
        return fileContent;
      });
  }
);
