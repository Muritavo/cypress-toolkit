const fs = require("fs");

Cypress.Commands.add(
  "readOptionalFile",
  (filepath: string, encoding?: BufferEncoding) => {
    return cy
      .execTask("readFileMaybe", { filepath, encoding }, {log: false})
      .then((fileContent) => {
        return fileContent;
      });
  }
);
