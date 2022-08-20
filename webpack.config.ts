/**
 * This configuration is just an example of setup for cypress.
 * 
 * USE IT JUST AS AN EXAMPLE
 */

import { createBaseConfiguration } from "@muritavo/webpack-microfrontend-scripts/bin/react/scripts/_webpackConfiguration"
import { resolve } from "path";
const baseConfig = createBaseConfiguration(resolve("."), "development")
baseConfig.output!.libraryTarget = "umd";
baseConfig.plugins = baseConfig.plugins!.filter(
    (a) => a.constructor.name !== "ModuleFederationPlugin"
);
baseConfig.module!.rules!.push({
    test: /\.m?js$/,
    resolve: {
        fullySpecified: false,
    },
})
export default baseConfig