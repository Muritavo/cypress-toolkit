/**
 * This configuration is just an example of setup for cypress.
 * 
 * USE IT JUST AS AN EXAMPLE
 */

import { createBaseConfiguration } from "@muritavo/webpack-microfrontend-scripts/bin/react/scripts/_webpackConfiguration"
import { resolve } from "path";
export default createBaseConfiguration(resolve("."), "development")