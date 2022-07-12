import { mount } from "cypress/react";
import React, { Fragment, ReactFragment } from "react";

function resultContainer() {
  var value: any = null;
  var error: any = null;
  var resolvers: any[] = [];
  var result = {
    get current() {
      if (error) {
        throw error;
      }
      return value;
    },
    get error() {
      return error;
    },
  };
  var updateResult: any = function (val: any, err: any) {
    if (err === void 0) {
      err = null;
    }
    value = val;
    error = err;
    resolvers.splice(0, resolvers.length).forEach(function (resolve) {
      return resolve();
    });
  };
  return {
    result: result,
    addResolver: function (resolver: any) {
      resolvers.push(resolver);
    },
    setValue: function (val: any) {
      return updateResult(val);
    },
    setError: function (err: any) {
      return updateResult(undefined, err);
    },
  };
}
function TestHook(_a: any) {
  var callback = _a.callback,
    onError = _a.onError,
    children = _a.children;
  try {
    children(callback());
  } catch (err: any) {
    if ("then" in err) {
      throw err;
    } else {
      onError(err);
    }
  }
  return null;
}
Cypress.Commands.add("mountHookWrap", function (hookFn, Wrapper) {
  var _a = resultContainer(),
    result = _a.result,
    setValue = _a.setValue,
    setError = _a.setError;
  var componentTest = React.createElement(
    Wrapper,
    undefined,
    React.createElement(TestHook, {
      callback: hookFn,
      onError: setError,
      children: setValue,
    })
  );
  return mount(componentTest).then(function () {
    return result;
  });
});

let currRenderFunc: any;
Cypress.Commands.add("mountChain", function renderChain(renderFunc) {
  mount(<Fragment />).then((r) => {
    currRenderFunc = (...props: Parameters<typeof renderFunc>) =>
      r.rerender(renderFunc(...props));
  });
});
Cypress.Commands.add("remount" as any, function (...props) {
  return currRenderFunc(...props);
});
