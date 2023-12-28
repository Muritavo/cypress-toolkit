/// <reference path="../../types/cypress.d.ts"/>

import "cypress-real-events/support";
import "cypress-wait-until";
import "cypress-file-upload";
import "@cypress/code-coverage/support";
import "./visual-testing";
import "./emulator";
import "./findingElements";
import "./utility";
import "./rendering";
import "./augmentation/cypress";
import "./blockchain";
import "./interaction";
import "./file-management";
import "./ai";
import registerItEach from "./extensions/it.each";
import { register } from "@cypress/snapshot";
register();
registerItEach();