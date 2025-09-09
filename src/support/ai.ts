import { createHash } from "crypto";
import { buildPrompt } from "../utility/localai.js";
import { CypressBrowserProcessWindow } from "../consts.js";

function hashStr(str: string) {
  const hasher = createHash("md5");
  hasher.write(str);
  return hasher
    .digest()
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "");
}

declare global {
  interface Window {
    inMemoryResponses: {
      [fp: string]: string | undefined | null;
    };
  }
}

function readFile(filepath: string, encoding: "utf-8" | "base64") {
  if (!CypressBrowserProcessWindow.inMemoryResponses) {
    CypressBrowserProcessWindow.inMemoryResponses = {};
  }
  const data = CypressBrowserProcessWindow.inMemoryResponses[filepath];
  if (!data)
    return cy.readOptionalFile(filepath, encoding).then((fileContent) => {
      return (CypressBrowserProcessWindow.inMemoryResponses[filepath] =
        fileContent);
    });
  else {
    return cy.wrap(data, { log: false });
  }
}

Cypress.Commands.add(
  "promptLlama",
  (model, sys, ppt, train, suffix, folder, config = {}) => {
    const prompt = buildPrompt(sys, ppt, train, suffix, "qwen");
    const hash = hashStr(prompt + String(config.seed || ""));
    const filepath = `cypress/ai/llama/${
      folder?.replace(/^\//, "").replace(/$\//, "").concat("/") || ""
    }${hash}.txt`;
    readFile(filepath, "utf-8").then((fileContent) => {
      if (fileContent === null)
        return cy
          .request({
            url: `${getAIConfig().server.textGen}/v1/completions`,
            method: "post",
            body: {
              prompt: prompt,
              model: model,
              ...config,
            },
            timeout: 120000,
          })
          .then((response) => {
            const responseTxt = response.body.choices[0].text;
            return cy.writeFile(filepath, responseTxt).then(() => responseTxt);
          });
      else return fileContent;
    });
  }
);

Cypress.Commands.add(
  "generateImage",
  (model, prompt, [width, height], folder) => {
    const hash = hashStr(`${prompt} ${width} ${height}`);
    const filepath = `cypress/ai/images/${
      folder?.replace(/^\//, "").replace(/$\//, "").concat("/") || ""
    }${hash}.png`;
    readFile(filepath, "base64").then((fileContent) => {
      const b64 = (b64Image: string) => `data:image/png;base64,${b64Image}`;

      if (fileContent === null)
        return cy
          .request({
            url: `${getAIConfig().server.imageGen}/v1/images/generations`,
            method: "post",
            body: {
              prompt: prompt,
              model: model,
              size: `${width}x${height}`,
              response_format: {
                type: "b64_json",
              },
            },
            timeout: 240000,
          })
          .then((response) => {
            const generatedImageUrl = Buffer.from(
              response.body.data[0].b64_json,
              "base64"
            );
            return cy
              .writeFile(filepath, generatedImageUrl.toString("binary"), {
                encoding: "binary",
              })
              .then(() => b64(response.body.data[0].b64_json));
          });
      else return b64(fileContent!);
    });
  }
);

type AIConfig = {
  server: {
    imageGen: string;
    textGen: string;
  };
};

let aiConfig: AIConfig;

function getAIConfig() {
  if (!aiConfig)
    throw new Error(`To use this api, you should configure the server first with:
import { setupAI } from "@muritavo/cypress-toolkit/dist/support/ai";

setupAI({
    server: "http://localhost:8080" // Example for localai server
})
`);
  return aiConfig;
}

export function setupAI(config: AIConfig) {
  aiConfig = config;
}
