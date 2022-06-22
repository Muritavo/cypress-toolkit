![npm](https://img.shields.io/npm/v/@muritavo/cypress-toolkit)

# Introduction

Cypress is an automation tool that (recently) can isolate and test components directly in the browser

More information can be found at https://docs.cypress.io/guides/component-testing/writing-your-first-component-test

This can be usefull for a full automation testing, including logic, compatibility and UI testing.

# What is the purpose of this library

Here I will be including a series of usefull tools for facilitating testing with cypress

To check the commands, you can take a look at index.d.ts. 

Let's hope everything is nicely documented :)

**Contribuition is also welcome**

# Before using

- Even though the objective of this library is to be a generic toolkit, it can feel a little opinated.

# How to use

- Install this library with `yarn add @muritavo/cypress-toolkit`
- Intercept the webpack config and include this library setup with

```js
// cypress/plugins/index.js
const setup = require("@muritavo/cypress-toolkit/dist/scripts/config.js");

...
...
module.exports = (on, config) => {
    ...
    ...

    return setup(on, config)
}
```

- Enable the custom commands by including this library like so:

```js
// cypress/support/index.js

require("@muritavo/cypress-toolkit/dist/support/essentials.js");
```
