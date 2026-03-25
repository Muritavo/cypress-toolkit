import { execTask } from "./augmentation/cypress.js";

import { addCommand } from "./_shared/register";

addCommand(
  "readOptionalFile",
  "Read a file from the filesystem, returning undefined if it doesn't exist. Takes filepath and optional encoding",
  { prevSubject: false },
  (filepath: string, encoding?: BufferEncoding) => {
    return execTask("readFileMaybe", { filepath, encoding }, { log: false })
      .then((fileContent) => fileContent);
  }
);
