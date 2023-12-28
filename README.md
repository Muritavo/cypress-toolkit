![npm](https://img.shields.io/npm/v/@muritavo/cypress-toolkit)

# Introduction

Cypress is an automation tool that (recently) can isolate and test components directly in the browser

More information can be found at https://docs.cypress.io/guides/component-testing/writing-your-first-component-test

This can be usefull for a full automation testing, including logic, compatibility and UI testing.

# What is the purpose of this library

Here I will be including a series of usefull tools for facilitating testing with cypress

To check the commands, you can take a look at index.d.ts.

Let's hope everything is nicely documented :)

**Contribution is also welcome**

# Before using

- Even though the objective of this library is to be a generic toolkit, it can feel a little opinated.

# How to use

- Install this library with `yarn add -D @muritavo/cypress-toolkit`
- For better intelisense support, include the typings at your _cypress/support/commands.ts_ file. If you don't have it, you can include it on any ts file inside your project. I suggest to create a ts file at _cypress/cypress.d.ts_

```ts
/// <reference types="@muritavo/cypress-toolkit"/>
```

- Intercept the cypress config and include this library setup with

```ts
// at cypress.config.ts

import setup from '@muritavo/cypress-toolkit/dist/scripts/config'

...
...
export default defineConfig({
    ...
    component: {
        ...,
        setupNodeEvents: (on, config) => {
            ...
            const config = setup(on, config);
            ...
            return config;
        },
        ...
    },
    ...
})
```

- Enable the custom commands by including this library like so:

```ts
// at cypress/support/commands.ts
import "@muritavo/cypress-toolkit/dist/support/essentials";
```
